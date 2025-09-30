import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Target, TrendingUp, Building, Star, Link, FileText, RotateCcw, RotateCw, Check, MoreHorizontal, HelpCircle, Folder, Pencil, Trash2 } from 'lucide-react';
import Sidebar from './Sidebar';

// Account type groupings and subtype definitions
const ACCOUNT_TYPE_GROUPS = {
  cash: {
    title: 'Cash Accounts',
    items: [
      { key: 'checking', label: 'Checking' },
      { key: 'savings', label: 'Savings' },
      { key: 'cash', label: 'Cash' },
    ],
  },
  credit: {
    title: 'Credit Accounts',
    items: [
      { key: 'credit_card', label: 'Credit Card' },
      { key: 'line_of_credit', label: 'Line of Credit' },
    ],
  },
  loans: {
    title: 'Loans',
    items: [
      { key: 'mortgage', label: 'Mortgage' },
      { key: 'auto_loan', label: 'Auto Loan' },
      { key: 'student_loan', label: 'Student Loan' },
      { key: 'personal_loan', label: 'Personal Loan' },
      { key: 'medical_debt', label: 'Medical Debt' },
      { key: 'other_debt', label: 'Other Debt' },
    ],
  },
  tracking: {
    title: 'Tracking Accounts',
    items: [
      { key: 'asset', label: 'Asset (e.g. Investment)' },
      { key: 'liability', label: 'Liability' },
    ],
  },
} as const;

type GroupKey = keyof typeof ACCOUNT_TYPE_GROUPS;

type SubtypeKey = typeof ACCOUNT_TYPE_GROUPS[GroupKey]['items'][number]['key'];

// Plan Settings for currency/locale/date formatting
type PlanSettings = {
  currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  placement: 'before' | 'after';
  numberFormat: '123,456.78' | '123.456,78' | '123 456,78' | "123’456.78";
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
};

type Plan = { id: string; name: string; lastUsed: string; settings?: PlanSettings };

const getGroupForSubtype = (subtype: string): GroupKey => {
  for (const g of Object.keys(ACCOUNT_TYPE_GROUPS) as GroupKey[]) {
    if (ACCOUNT_TYPE_GROUPS[g].items.find(i => i.key === subtype)) return g;
  }
  return 'cash';
};

const App = () => {
  // State Management
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1));
  const [activeView, setActiveView] = useState('PreBudget');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filterTab, setFilterTab] = useState('All');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [allCategoriesSelected, setAllCategoriesSelected] = useState(false);
  const [focusedCategory, setFocusedCategory] = useState(null);
  // Budget selection/creation (Pre-Budget screen)
  const [budgetName, setBudgetName] = useState('Budget');
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [openPlanOpen, setOpenPlanOpen] = useState(false);
  const budgetMenuRef = useRef<HTMLDivElement | null>(null);
  const budgetMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  // Create Plan modal fields
  const [planCurrency, setPlanCurrency] = useState('CAD');
  const [currencyPlacement, setCurrencyPlacement] = useState<'before' | 'after'>('before');
  const [numberFormat, setNumberFormat] = useState('123,456.78');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  // Default settings for migration and new plans
  const getDefaultSettings = (): PlanSettings => ({
    currency: 'CAD',
    placement: 'before',
    numberFormat: '123,456.78',
    dateFormat: 'MM/DD/YYYY',
  });

  // Active plan settings used by UI formatting
  const [currentSettings, setCurrentSettings] = useState<PlanSettings>(getDefaultSettings());
  // Rename/Delete modals
  const [showRenamePlan, setShowRenamePlan] = useState(false);
  const [showDeletePlan, setShowDeletePlan] = useState(false);
  const [planTargetId, setPlanTargetId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  // Modal step for Add Account flow (kept separate from main activeView)
  const [addAccountStep, setAddAccountStep] = useState<'form' | 'type' | 'success'>('form');
  
  // Load/save plans
  useEffect(() => {
    try {
      const saved = localStorage.getItem('plans');
      if (saved) {
        const loadedPlans = JSON.parse(saved) as Plan[];
        // Migrate plans that don't have settings
        const migratedPlans = loadedPlans.map(plan => ({
          ...plan,
          settings: plan.settings || getDefaultSettings()
        }));
        setPlans(migratedPlans);
        
        // Save migrated plans back if any were missing settings
        const needsMigration = loadedPlans.some(p => !p.settings);
        if (needsMigration) {
          localStorage.setItem('plans', JSON.stringify(migratedPlans));
        }
      }
      const current = localStorage.getItem('currentPlan');
      if (current) setBudgetName(current);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('plans', JSON.stringify(plans));
    } catch {}
  }, [plans]);
  useEffect(() => {
    try {
      localStorage.setItem('currentPlan', budgetName);
    } catch {}
  }, [budgetName]);

  // Helpers for plan operations
  const openPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    setBudgetName(plan.name);
    setCurrentSettings(plan.settings || getDefaultSettings());
    setActiveView('Plan');
    const now = new Date().toISOString();
    setPlans(prev => prev
      .map(p => p.id === planId ? { ...p, lastUsed: now } : p)
      .sort((a,b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    );
    setShowBudgetMenu(false);
    setOpenPlanOpen(false);
  };

  const createPlan = (name: string) => {
    const trimmed = name.trim() || 'Budget';
    const now = new Date().toISOString();
    const newSettings: PlanSettings = {
      currency: planCurrency as any,
      placement: currencyPlacement,
      numberFormat: numberFormat as PlanSettings['numberFormat'],
      dateFormat: dateFormat as PlanSettings['dateFormat'],
    };
    setPlans(prev => {
      const exists = prev.find(p => p.name === trimmed);
      const next = exists
        ? prev.map(p => p.name === trimmed ? { ...p, lastUsed: now, settings: newSettings } : p)
        : [...prev, { id: Date.now().toString(), name: trimmed, lastUsed: now, settings: newSettings }];
      return next.sort((a,b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
    });
    setBudgetName(trimmed);
    setCurrentSettings(newSettings);
    setActiveView('Plan');
    setShowCreateBudget(false);
    setNewBudgetName('');
  };

  const renamePlan = (planId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, name: trimmed } : p));
    if (plans.find(p => p.id === planId)?.name === budgetName) {
      setBudgetName(trimmed);
    }
  };

  const deletePlan = (planId: string) => {
    const removed = plans.find(p => p.id === planId);
    setPlans(prev => prev.filter(p => p.id !== planId));
    if (removed && removed.name === budgetName) {
      // If current plan deleted, go back to prebudget
      setActiveView('PreBudget');
      setBudgetName('Budget');
    }
  };

  // Close menus on outside click or Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const menuEl = budgetMenuRef.current;
      const btnEl = budgetMenuButtonRef.current;
      if (!menuEl || !btnEl) return;
      const target = e.target as Node;
      if (!menuEl.contains(target) && !btnEl.contains(target)) {
        setShowBudgetMenu(false);
        setOpenPlanOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBudgetMenu(false);
        setOpenPlanOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Account Data
  const [accounts, setAccounts] = useState([] as any);

  // Transaction Data
  const [transactions, setTransactions] = useState({
    1: [{ id: 1, date: '09/28/2025', payee: 'Starting Balance', category: 'Inflow: Ready to Assign', memo: '', outflow: null, inflow: 500.00, cleared: true }],
    2: [],
    3: [{ id: 1, date: '09/28/2025', payee: 'Starting Balance', category: '', memo: '', outflow: 100.00, inflow: null, cleared: true }]
  });

  // Category Groups Data
  const [categoryGroups, setCategoryGroups] = useState([
    {
      id: 1,
      name: 'Bills',
      collapsed: false,
      selected: false,
      categories: [
        { id: 1, name: 'Rent/Mortgage', assigned: 0, selected: false },
        { id: 2, name: 'Electric', assigned: 0, selected: false },
        { id: 3, name: 'Water', assigned: 0, selected: false },
        { id: 4, name: 'Internet', assigned: 0, selected: false },
        { id: 5, name: 'Cellphone', assigned: 0, selected: false }
      ]
    },
    {
      id: 2,
      name: 'Frequent',
      collapsed: false,
      selected: false,
      categories: [
        { id: 6, name: 'Groceries', assigned: 0, selected: false },
        { id: 7, name: 'Eating Out', assigned: 0, selected: false },
        { id: 8, name: 'Transportation', assigned: 0, selected: false }
      ]
    },
    {
      id: 3,
      name: 'Non-Monthly',
      collapsed: false,
      selected: false,
      categories: [
        { id: 9, name: 'Home Maintenance', assigned: 0, selected: false },
        { id: 10, name: 'Auto Maintenance', assigned: 0, selected: false },
        { id: 11, name: 'Gifts', assigned: 0, selected: false }
      ]
    },
    {
      id: 4,
      name: 'Goals',
      collapsed: false,
      selected: false,
      categories: [
        { id: 12, name: 'Vacation', assigned: 0, selected: false },
        { id: 13, name: 'Education', assigned: 0, selected: false },
        { id: 14, name: 'Home Improvement', assigned: 0, selected: false }
      ]
    },
    {
      id: 5,
      name: 'Quality of Life',
      collapsed: false,
      selected: false,
      categories: [
        { id: 15, name: 'Hobbies', assigned: 0, selected: false },
        { id: 16, name: 'Entertainment', assigned: 0, selected: false },
        { id: 17, name: 'Health & Wellness', assigned: 0, selected: false }
      ]
    }
  ]);

  // Form States
  const [newAccount, setNewAccount] = useState({ name: '', group: '', subtype: '', balance: '' });
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    payee: '',
    category: '',
    memo: '',
    outflow: '',
    inflow: ''
  });

  // Helper Functions
  // Map numberFormat to a representative locale for grouping/decimal separators
  const numberFormatToLocale: Record<PlanSettings['numberFormat'], string> = {
    '123,456.78': 'en-CA',
    '123.456,78': 'de-DE',
    '123 456,78': 'fr-FR',
    "123’456.78": 'de-CH',
  };

  const formatMoney = (value: number) => {
    const { currency, placement, numberFormat } = currentSettings;
    const locale = numberFormatToLocale[numberFormat] || 'en-CA';
    // Use Intl to format, but reconstruct placement to honor explicit choice
    const nf = new Intl.NumberFormat(locale, { style: 'currency', currency });
    const parts = nf.formatToParts(Math.abs(value));
    const amount = parts.filter(p => p.type !== 'currency' && p.type !== 'literal' && p.type !== 'minusSign').map(p => p.value).join('');
    const symbol = parts.find(p => p.type === 'currency')?.value ?? '';
    const sign = value < 0 ? '-' : '';
    return placement === 'before' ? `${sign}${symbol}${amount}` : `${sign}${amount}${symbol}`;
  };

  const parseCurrency = (value) => {
    return value.replace(/[^0-9.-]/g, '');
  };

  const formatDate = (date: Date) => {
    const df = currentSettings.dateFormat;
    const y = String(date.getFullYear());
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (df === 'DD/MM/YYYY') return `${d}/${m}/${y}`;
    if (df === 'YYYY-MM-DD') return `${y}-${m}-${d}`;
    return `${m}/${d}/${y}`; // MM/DD/YYYY
  };

  const calculateCategoryActivity = (categoryName) => {
    let totalActivity = 0;
    Object.values(transactions).forEach(accountTransactions => {
      accountTransactions.forEach(transaction => {
        if (transaction.category === categoryName && transaction.outflow) {
          totalActivity += transaction.outflow;
        }
      });
    });
    return totalActivity;
  };

  const calculateReadyToAssign = () => {
    const cashTotal = accounts
      .filter((acc: any) => acc.group === 'cash')
      .reduce((sum: number, acc: any) => sum + acc.balance, 0);
    
    const totalAssigned = categoryGroups.reduce((sum, group) => 
      sum + group.categories.reduce((catSum, cat) => catSum + cat.assigned, 0), 0
    );
    
    return cashTotal - totalAssigned;
  };

  const readyToAssign = calculateReadyToAssign();

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const toggleGroup = (groupId) => {
    setCategoryGroups(groups => groups.map(group =>
      group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
    ));
  };

  const toggleGroupSelection = (groupId) => {
    setCategoryGroups(groups => groups.map(group => {
      if (group.id === groupId) {
        const newSelected = !group.selected;
        return {
          ...group,
          selected: newSelected,
          categories: group.categories.map(cat => ({ ...cat, selected: newSelected }))
        };
      }
      return group;
    }));
  };

  const toggleCategorySelection = (groupId, categoryId) => {
    setCategoryGroups(groups => groups.map(group => {
      if (group.id === groupId) {
        const newCategories = group.categories.map(cat =>
          cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
        );
        const allSelected = newCategories.every(cat => cat.selected);
        return {
          ...group,
          selected: allSelected,
          categories: newCategories
        };
      }
      return group;
    }));
  };

  const toggleAllCategories = () => {
    const newSelected = !allCategoriesSelected;
    setAllCategoriesSelected(newSelected);
    setCategoryGroups(groups => groups.map(group => ({
      ...group,
      selected: newSelected,
      categories: group.categories.map(cat => ({ ...cat, selected: newSelected }))
    })));
  };

  const updateCategoryAssignment = (groupId, categoryId, value) => {
    const numValue = parseFloat(value) || 0;
    setCategoryGroups(groups => groups.map(group =>
      group.id === groupId ? {
        ...group,
        categories: group.categories.map(cat =>
          cat.id === categoryId ? { ...cat, assigned: numValue } : cat
        )
      } : group
    ));
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setActiveView('Account');
  };

  const addAccount = () => {
    if (newAccount.name && newAccount.subtype !== '' && newAccount.balance !== '') {
      const raw = parseFloat(newAccount.balance) || 0;
      const group = newAccount.group || getGroupForSubtype(newAccount.subtype);

      // Balance sign rules
      const isDebt = group === 'credit' || group === 'loans' || (group === 'tracking' && newAccount.subtype === 'liability');
      const normalizedBalance = isDebt ? -Math.abs(raw) : Math.abs(raw);

      const newAcct: any = {
        id: accounts.length + 1,
        name: newAccount.name,
        group,
        subtype: newAccount.subtype,
        balance: normalizedBalance,
        clearedBalance: normalizedBalance,
        unclearedBalance: 0,
      };

      setAccounts([...accounts, newAcct]);

      // Starting transaction rules: only affect the budget for cash
      if (raw !== 0) {
        const isCash = group === 'cash';
        const tx = {
          id: 1,
          date: new Date().toLocaleDateString('en-US'),
          payee: 'Starting Balance',
          category: isCash && normalizedBalance > 0 ? 'Inflow: Ready to Assign' : '',
          memo: '',
          outflow: isCash ? (normalizedBalance < 0 ? Math.abs(normalizedBalance) : null) : (isDebt ? Math.abs(raw) : null),
          inflow: isCash ? (normalizedBalance > 0 ? normalizedBalance : null) : (!isDebt ? Math.abs(raw) : null),
          cleared: true,
        } as any;
        setTransactions(prev => ({ ...prev, [newAcct.id]: [tx] }));
      } else {
        setTransactions(prev => ({ ...prev, [newAcct.id]: [] }));
      }
    }
  };

  const getAllCategories = () => {
    const cats = ['Inflow: Ready to Assign'];
    categoryGroups.forEach(group => {
      group.categories.forEach(cat => cats.push(cat.name));
    });
    return cats;
  };

  // Common cell styles for alignment
  const cellStyle = {
    assigned: { textAlign: 'right' as const, paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' },
    activity: { textAlign: 'right' as const, paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' },
    available: { textAlign: 'right' as const, paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' }
  };

  // Sidebar Styles - Modern Design
  const sidebarStyle = {
    backgroundColor: '#FFFFFF',
    width: '280px',
    borderRight: '1px solid #E5E7EB'
  };

  const sectionTitle = (label: string) => (
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
  );

  const activeButtonStyle = {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    color: '#1E40AF'
  };

  return (
    <>
      {activeView === 'PreBudget' && (
        <div className="min-h-screen" style={{backgroundColor: '#FDFCFC'}}>
          <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-semibold mb-6">Your Plans</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Existing plans */}
              {plans.map(p => (
                <div key={p.id} className="aspect-[4/3] bg-white rounded-xl border shadow-sm flex flex-col">
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-16 h-16 text-blue-500" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <button onClick={() => openPlan(p.id)} className="font-semibold text-gray-900 hover:text-blue-600 text-left truncate">{p.name}</button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setPlanTargetId(p.id); setRenameInput(p.name); setShowRenamePlan(true); }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Rename"
                        >
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => { setPlanTargetId(p.id); setShowDeletePlan(true); }}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Last used {formatDate(new Date(p.lastUsed))}</div>
                  </div>
                </div>
              ))}

              {/* Create New Plan Card */}
              <button
                onClick={() => setShowCreateBudget(true)}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors flex items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center mb-3">+
                  </div>
                  <div className="font-medium text-gray-700">Create New Plan</div>
                </div>
              </button>
            </div>
          </div>

          {/* Create Plan Modal */}
          {showCreateBudget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) { setShowCreateBudget(false); } }}>
              <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b">
                  <h2 className="text-2xl font-semibold">New Plan</h2>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                    <input
                      type="text"
                      value={newBudgetName}
                      onChange={(e) => setNewBudgetName(e.target.value)}
                      placeholder="e.g., Household, Business, Vacation"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      value={planCurrency}
                      onChange={(e) => setPlanCurrency(e.target.value)}
                    >
                      <option value="CAD">Canadian Dollar—CAD</option>
                      <option value="USD">US Dollar—USD</option>
                      <option value="EUR">Euro—EUR</option>
                      <option value="GBP">British Pound—GBP</option>
                      <option value="AUD">Australian Dollar—AUD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Placement</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      value={currencyPlacement}
                      onChange={(e) => setCurrencyPlacement(e.target.value as any)}
                    >
                      <option value="before">Before amount (${numberFormat})</option>
                      <option value="after">After amount ({numberFormat}$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number Format</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      value={numberFormat}
                      onChange={(e) => setNumberFormat(e.target.value)}
                    >
                      <option>123,456.78</option>
                      <option>123.456,78</option>
                      <option>123 456,78</option>
                      <option>123’456.78</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <option value="MM/DD/YYYY">12/30/2025</option>
                      <option value="DD/MM/YYYY">30/12/2025</option>
                      <option value="YYYY-MM-DD">2025-12-30</option>
                    </select>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex gap-3 justify-end" style={{backgroundColor: '#FDFCFC'}}>
                  <button
                    onClick={() => { setShowCreateBudget(false); setNewBudgetName(''); }}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createPlan(newBudgetName)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!newBudgetName.trim()}
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView !== 'PreBudget' && (
        <div className="h-screen flex" style={{backgroundColor: '#FDFCFC'}} onClick={() => { /* close popovers when clicking main content */ setShowBudgetMenu(false); setOpenPlanOpen(false); }}>
      {/* Left Sidebar - New Design */}
      <div className="relative">
        <Sidebar
          budgetName={budgetName}
          email="perezcipolab@gmail.com"
          activeView={activeView}
          accounts={accounts}
          selectedAccount={selectedAccount}
          onViewChange={(view) => { setActiveView(view); setSelectedAccount(null); }}
          onAccountClick={handleAccountClick}
          onAddAccount={() => { setAddAccountStep('form'); setShowAddAccount(true); }}
          onBudgetMenuClick={() => setShowBudgetMenu(v => !v)}
          formatMoney={formatMoney}
        />
        
        {/* Budget Menu Overlay */}
        {showBudgetMenu && (
          <div ref={budgetMenuRef} className="absolute left-4 top-20 bg-white text-gray-900 rounded-xl shadow-xl border w-72 z-20">
            <div className="py-2">
              <button
                onClick={() => { setShowCreateBudget(true); setShowBudgetMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                  <Plus className="w-4 h-4 text-blue-600" />
                </span>
                <span className="font-medium text-gray-900">New Plan</span>
              </button>

              <div
                className="relative"
                onMouseEnter={() => setOpenPlanOpen(true)}
                onMouseLeave={() => setOpenPlanOpen(false)}
              >
                <div
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setOpenPlanOpen(v => !v)}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Open Plan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                {openPlanOpen && (
                  <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-xl w-64 z-30">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500">Recent Plans</div>
                    <div className="py-1 max-h-60 overflow-auto">
                      {plans.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">No plans yet</div>
                      ) : (
                        plans.slice(0, 6).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => openPlan(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                          >
                            <FileText className="w-5 h-5 text-gray-600" />
                            <span className="text-sm">{p.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => { setShowBudgetMenu(false); setActiveView('PreBudget'); setOpenPlanOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
                    >
                      <Folder className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">View All Plans</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Plan View */}
      {activeView === 'Plan' && !selectedAccount && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b px-6 py-4">
            <div className="flex itemscenter justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">{formatMonth(currentMonth)}</h1>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="text-sm text-gray-500 hover:text-gray-700">Enter a note...</button>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg font-medium ${
                  readyToAssign === 0 ? 'bg-green-500 text-white' :
                  readyToAssign > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className="text-2xl font-bold">{formatMoney(Math.abs(readyToAssign))}</div>
                  <div className="text-xs">All Money Assigned</div>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                  Assign
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              {['All', 'Underfunded', 'Overfunded', 'Money Available', 'Snoozed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filterTab === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[900px]" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: '32px' }} />
                <col />
                <col style={{ width: '150px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '180px' }} />
              </colgroup>
              <thead className="border-b text-xs font-medium text-gray-500 uppercase sticky top-0" style={{backgroundColor: '#FDFCFC'}}>
                <tr>
                  <th className="px-2 py-3">
                    <ChevronDown className="w-4 h-4 mx-auto" />
                  </th>
                  <th className="px-2 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={allCategoriesSelected}
                      onChange={toggleAllCategories}
                    />
                  </th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-right px-4 py-3">Assigned</th>
                  <th className="text-right px-4 py-3">Activity</th>
                  <th className="text-right px-4 py-3">Available</th>
                </tr>
              </thead>

              <tbody>
                {categoryGroups.map(group => {
                  const groupAssigned = group.categories.reduce((sum, cat) => sum + cat.assigned, 0);
                  const groupActivity = group.categories.reduce((sum, cat) => sum + calculateCategoryActivity(cat.name), 0);
                  const groupAvailable = groupAssigned - groupActivity;

                  return (
                    <React.Fragment key={group.id}>
                      {/* Group Header Row */}
                      <tr className="border-b" style={{ backgroundColor: '#F8F6F2' }} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#F0EDE6'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#F8F6F2'}>
                        <td className="px-2 py-3">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="w-full flex items-center justify-center"
                          >
                            {group.collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-2 py-3">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={group.selected}
                            onChange={() => toggleGroupSelection(group.id)}
                          />
                        </td>
                        <td className="py-3 font-medium text-sm" style={{ paddingLeft: '16px' }}>{group.name}</td>
                        <td style={cellStyle.assigned}>{formatMoney(groupAssigned)}</td>
                        <td style={cellStyle.activity}>{formatMoney(groupActivity)}</td>
                        <td style={cellStyle.available}>{formatMoney(groupAvailable)}</td>
                      </tr>

                      {/* Category Rows */}
                      {!group.collapsed && group.categories.map(category => {
                        const activity = calculateCategoryActivity(category.name);
                        const available = category.assigned - activity;
                        const isOverspent = available < 0;
                        const isCreditCard = category.name === 'Credit Card';

                        return (
                          <tr 
                            key={category.id}
                            className={`border-b ${category.selected ? 'bg-blue-50' : ''}`}
                            style={category.selected ? {} : {backgroundColor: '#FDFCFC'}}
                            onMouseEnter={(e) => { if (!category.selected) { ((e.target as HTMLElement).closest('tr') as HTMLElement).style.backgroundColor = '#F5F5F5'; } }}
                            onMouseLeave={(e) => { if (!category.selected) { ((e.target as HTMLElement).closest('tr') as HTMLElement).style.backgroundColor = '#FDFCFC'; } }}
                          >
                            <td className="px-2 py-3"></td>
                            <td className="px-2 py-3">
                              <input 
                                type="checkbox" 
                                className="rounded"
                                checked={category.selected}
                                onChange={() => toggleCategorySelection(group.id, category.id)}
                              />
                            </td>
                            <td className="py-3 text-sm" style={{ paddingLeft: '16px' }}>{category.name}</td>
                            <td style={cellStyle.assigned}>
                              {focusedCategory === category.id ? (
                                <input
                                  type="text"
                                  value={category.assigned || ''}
                                  onChange={(e) => {
                                    const parsed = parseCurrency(e.target.value);
                                    updateCategoryAssignment(group.id, category.id, parsed);
                                  }}
                                  onFocus={() => setFocusedCategory(category.id)}
                                  onBlur={() => setFocusedCategory(null)}
                                  className="w-full text-right px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  style={{ fontSize: '14px', fontWeight: '500' }}
                                  placeholder="$0.00"
                                />
                              ) : (
                                <div
                                  onClick={() => setFocusedCategory(category.id)}
                                  className="cursor-text"
                                  style={{ color: category.assigned ? 'inherit' : '#9CA3AF' }}
                                >
                                  {formatMoney(category.assigned || 0)}
                                </div>
                              )}
                            </td>
                            <td style={cellStyle.activity}>{formatMoney(activity)}</td>
                            <td style={cellStyle.available}>
                              {isCreditCard ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span style={{ color: isOverspent ? '#DC2626' : available > 0 ? '#16A34A' : '#4B5563' }}>
                                    {formatMoney(available)}
                                  </span>
                                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 whitespace-nowrap">
                                    <HelpCircle className="w-3 h-3" />
                                    PAYMENT
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: isOverspent ? '#DC2626' : available > 0 ? '#16A34A' : '#4B5563' }}>
                                  {formatMoney(available)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Right Sidebar */}
      {activeView === 'Plan' && !selectedAccount && (
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Summary Section */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm font-medium">September's Summary</div>
              <ChevronDown className="w-4 h-4" />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Left Over from Last Month</span>
                <span>{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assigned in September</span>
                <span>{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activity</span>
                <span>{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-gray-600">Available</span>
                <span>{formatMoney(0)}</span>
              </div>
            </div>
          </div>

          {/* Cost to Be Me Section */}
          <div className="p-4 border-b">
            <div className="text-sm font-medium mb-2">Cost to Be Me</div>
            <div className="text-sm text-gray-600">September's Targets</div>
            <div className="text-blue-600 text-sm mt-2 cursor-pointer hover:underline">
              Enter your expected income
            </div>
          </div>

          {/* Auto Assign Section */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">⚡ Auto Assign</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Underfunded</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Assigned Last Month</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Spent Last Month</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Average Assigned</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Average Spent</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Reset Available Amounts</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Reset Assigned Amounts</span>
                <span className="text-blue-600">{formatMoney(0)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Assigned in Future Months</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">October</span>
                <span>{formatMoney(0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowAddAccount(false); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[360px] h-[600px] p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Account</h2>
              <button onClick={() => setShowAddAccount(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 overflow-auto">
              {/* Step: Type Selection Subpage */}
              {addAccountStep === 'type' ? (
                <div className="space-y-6">
                  {(Object.keys(ACCOUNT_TYPE_GROUPS) as GroupKey[]).map((g) => (
                    <div key={g}>
                      <div className="text-sm font-semibold text-gray-700 mb-1">{ACCOUNT_TYPE_GROUPS[g].title}</div>
                      <div className="text-xs text-gray-500 mb-3">
                        {g === 'cash' && 'A cash account holds funds you already own and can spend immediately.'}
                        {g === 'credit' && "A credit account lets you spend borrowed money that you'll need to repay later, often with interest."}
                        {g === 'loans' && 'Loan accounts track debts you owe and will repay over time.'}
                        {g === 'tracking' && 'Tracking accounts do not affect your budget totals.'}
                      </div>
                      <div className="space-y-2">
                        {ACCOUNT_TYPE_GROUPS[g].items.map(item => (
                          <button
                            key={item.key}
                            onClick={() => {
                              const group = g;
                              setNewAccount({ ...newAccount, group, subtype: item.key as any });
                              setAddAccountStep('form');
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg border hover:bg-gray-50"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : addAccountStep === 'success' ? (
                <div className="h-full text-center flex flex-col items-center justify-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="text-green-600 w-8 h-8" />
                  </div>
                  <div className="text-2xl font-semibold">Success!</div>
                  <div className="text-gray-600 max-w-md mx-auto">
                    Add transactions anytime. Tracking accounts don’t affect your budget.
                  </div>
                </div>
              ) : (
                // Default: Form step
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Give it a nickname</div>
                    <input
                      type="text"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">What type of account are you adding?</div>
                    <button
                      onClick={() => setAddAccountStep('type')}
                      className="w-full px-3 py-2 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className={newAccount.subtype ? 'text-gray-900' : 'text-gray-500'}>
                        {newAccount.subtype
                          ? ACCOUNT_TYPE_GROUPS[newAccount.group as GroupKey]?.items.find(i => i.key === (newAccount.subtype as any))?.label || 'Select account type...'
                          : 'Select account type...'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">What is your current account balance?</div>
                    <input
                      type="number"
                      step="0.01"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      For Credit, Loans, and Liabilities, positive amounts will be stored as negative balances.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              {addAccountStep === 'type' ? (
                <button
                  onClick={() => setAddAccountStep('form')}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Back
                </button>
              ) : addAccountStep === 'success' ? (
                <>
                  <button
                    onClick={() => {
                      setNewAccount({ name: '', group: '', subtype: '', balance: '' });
                      setAddAccountStep('form');
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  >
                    Add Another
                  </button>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { addAccount(); setAddAccountStep('success'); }}
                    disabled={!newAccount.name || !newAccount.subtype || newAccount.balance === ''}
                    className={`ml-auto px-4 py-2 rounded-lg ${(!newAccount.name || !newAccount.subtype || newAccount.balance === '') ? 'bg-blue-300 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Plan Modal */}
      {showDeletePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) { setShowDeletePlan(false); } }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-red-600">Delete Plan</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete this plan? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowDeletePlan(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (planTargetId) {
                    setPlans(plans.filter(p => p.id !== planTargetId));
                    setPlanTargetId(null);
                  }
                  setShowDeletePlan(false);
                }}
                className="ml-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Plan Modal */}
      {showRenamePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) { setShowRenamePlan(false); } }}>
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Rename Plan</h2>
            </div>
            <div className="p-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Plan name</label>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => { setShowRenamePlan(false); setRenameInput(''); }}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (planTargetId && renameInput.trim()) {
                    setPlans(plans.map(p => p.id === planTargetId ? { ...p, name: renameInput.trim() } : p));
                    setPlanTargetId(null);
                  }
                  setShowRenamePlan(false);
                  setRenameInput('');
                }}
                className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
