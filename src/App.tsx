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
  const [allGroupsCollapsed, setAllGroupsCollapsed] = useState(false);
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
        { id: 2, name: 'Internet', assigned: 0, selected: false },
        { id: 3, name: 'Phone', assigned: 0, selected: false }
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

  const toggleAllGroups = () => {
    const newCollapsed = !allGroupsCollapsed;
    setAllGroupsCollapsed(newCollapsed);
    setCategoryGroups(groups => groups.map(group => ({
      ...group,
      collapsed: newCollapsed
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
    <React.Fragment>
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
        <div className="min-h-screen flex justify-center overflow-hidden" style={{backgroundColor: '#FDFCFC'}}>
          <div className="w-full h-screen flex gap-[12px] px-[32px] py-0" style={{ boxSizing: 'border-box' }}>
      {/* Left Sidebar - Fixed */}
      <div className="relative h-screen overflow-y-auto shrink-0 z-50" onClick={(e) => e.stopPropagation()}>
        <Sidebar
          budgetName={budgetName}
          email="jr@studiojrba.com"
          activeView={activeView}
          accounts={accounts}
          selectedAccount={selectedAccount}
          onViewChange={(view) => { setActiveView(view); setSelectedAccount(null); }}
          onAccountClick={handleAccountClick}
          onAddAccount={() => { setAddAccountStep('form'); setShowAddAccount(true); }}
          onBudgetMenuClick={() => setShowBudgetMenu(v => !v)}
          formatMoney={formatMoney}
          showBudgetMenu={showBudgetMenu}
          plans={plans}
          onNewPlanClick={() => { setShowCreateBudget(true); setShowBudgetMenu(false); }}
          onOpenPlan={(planId) => openPlan(planId)}
          onViewAllPlans={() => { setShowBudgetMenu(false); setActiveView('PreBudget'); setOpenPlanOpen(false); }}
        />
      </div>

      {/* Main Content Area - Plan View - Flexible Width */}
      {activeView === 'Plan' && !selectedAccount && (
        <React.Fragment>
        <div className="flex-1 flex flex-col gap-0 pb-[45px] min-w-0 h-screen overflow-y-auto scrollbar-overlay">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-20 bg-[#FDFCFC] flex items-center justify-between overflow-clip py-[16px] px-[8px]">
            <div className="flex gap-[16px] items-center">
              <div className="flex gap-[8px] items-center">
                <button onClick={() => changeMonth(-1)} className="w-[20px] h-[20px] flex items-center justify-center">
                  <ChevronLeft className="w-[10px] h-[10px] text-[#332f30]" strokeWidth={1.5} />
                </button>
                <div className="px-[8px]">
                  <div className="text-[20px] font-semibold leading-[15.75px] text-[#332f30]" style={{ fontFamily: "'PP Mori', 'Futura PT', sans-serif" }}>
                    {formatMonth(currentMonth)}
                  </div>
                </div>
                <button onClick={() => changeMonth(1)} className="w-[20px] h-[20px] flex items-center justify-center">
                  <ChevronRight className="w-[10px] h-[10px] text-[#332f30]" strokeWidth={1.5} />
                </button>
              </div>
              <div className="text-[14.9px] leading-[22px] text-[rgba(50,48,47,0.5)]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                Enter a note...
              </div>
            </div>
            <div className="bg-[#ecf2f6] rounded-[16px] p-[16px] flex gap-[24px] items-center">
              <div className="flex flex-col">
                <div className="text-[18px] font-semibold leading-[25.2px] text-[#696763]" style={{ fontFamily: "'PP Mori', 'Futura PT', sans-serif" }}>
                  {formatMoney(Math.abs(readyToAssign))}
                </div>
                <div className="text-[12px] leading-[16.8px] text-[#696763]" style={{ fontFamily: "'PP Mori', 'Futura PT', sans-serif" }}>
                  All Money Assigned
                </div>
              </div>
              <div className="w-[20px] h-[20px]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#696763" strokeWidth="1.5" fill="none"/>
                  <path d="M13.5 9L10 12.5L6.5 9" stroke="#696763" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Category Card */}
          <div className="flex gap-[10px] items-center p-[8px] w-full">
            <div className="flex-1 bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] flex flex-col overflow-x-auto min-w-0">
            {/* Toolbar Row */}
            <div className="flex gap-[16px] items-center px-[24px] py-[8px] bg-white">
              <div className="flex gap-[12px] items-center py-[4px]">
                <Plus className="w-[10px] h-[10px] text-[#332f30]" strokeWidth={2} />
                <div className="text-[14px] leading-[16.8px] text-[#332f30]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                  Category Group
                </div>
              </div>
              <div className="flex gap-[12px] items-center py-[4px]">
                <div className="flex gap-[12px] items-center justify-center px-[8px] py-[4px] rounded-[8px]">
                  <RotateCcw className="w-[12px] h-[12px] text-[#332f30]" strokeWidth={2} />
                  <div className="text-[14px] leading-[16.8px] text-[#332f30]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                    Undo
                  </div>
                </div>
                <div className="flex gap-[12px] items-center justify-center px-[8px] py-[4px] rounded-[8px]">
                  <RotateCw className="w-[12px] h-[12px] text-[#332f30]" strokeWidth={2} />
                  <div className="text-[14px] leading-[16.8px] text-[#332f30]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                    Redo
                  </div>
                </div>
              </div>
              <div className="flex gap-[12px] items-center py-[4px]">
                <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 6H12M12 6L7 1M12 6L7 11" stroke="#332f30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-[14px] leading-[16.8px] text-[#332f30]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                  Recent Moves
                </div>
              </div>
            </div>
            <div className="h-[1px] bg-[#e5e7eb] w-full"></div>

            {/* Table Header */}
            <div className="flex gap-[12px] h-[80px] items-center p-[8px]">
              <div className="flex-1 flex items-center justify-between h-full p-[16px] rounded-[8px]">
                <div className="flex gap-[8px] items-center">
                  <div className="flex gap-[12px] items-center justify-end w-[35px]">
                    <button
                      onClick={toggleAllGroups}
                      className="flex items-center justify-center cursor-pointer"
                      style={{ transform: allGroupsCollapsed ? 'rotate(270deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L3 4L1 7" stroke="#332f30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="w-[13px] h-[13px] bg-white rounded-[3px] border border-[#acaaa5] flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="w-[13px] h-[13px] rounded-[3px] border-[#acaaa5] cursor-pointer"
                        checked={allCategoriesSelected}
                        onChange={toggleAllCategories}
                        style={{ margin: 0, padding: 0 }}
                      />
                    </div>
                  </div>
                  <div className="text-[16px] leading-[25.2px] text-[#32302f]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                    Category
                  </div>
                </div>
                <div className="flex gap-[110px] items-center h-full">
                  <div className="flex items-center justify-end w-[75px]">
                    <div className="text-[14px] leading-[14.4px] text-[#332f30] text-right" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                      Assigned
                    </div>
                  </div>
                  <div className="flex items-center justify-end w-[75px]">
                    <div className="text-[14px] leading-[14.4px] text-[#332f30] text-right" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                      Activity
                    </div>
                  </div>
                  <div className="flex items-center justify-end w-[75px]">
                    <div className="text-[14px] leading-[14.4px] text-[#332f30] text-right font-medium" style={{ fontFamily: "'Futura PT', sans-serif" }}>
                      Available
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#e5e7eb] w-full"></div>

            {/* Categories */}
            {categoryGroups.map(group => {
              const groupAssigned = group.categories.reduce((sum, cat) => sum + cat.assigned, 0);
              const groupActivity = group.categories.reduce((sum, cat) => sum + calculateCategoryActivity(cat.name), 0);
              const groupAvailable = groupAssigned - groupActivity;

              return (
                <React.Fragment key={group.id}>
                  {/* Group Header Row */}
                  <div className="flex gap-[12px] h-[80px] items-center p-[8px]">
                    <div className="flex-1 flex items-center justify-between h-full p-[16px] rounded-[8px]">
                      <div className="flex gap-[8px] items-center">
                        <div className="flex gap-[12px] items-center justify-end w-[35px]">
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className="flex items-center justify-center cursor-pointer"
                            style={{ transform: group.collapsed ? 'rotate(270deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1L3 4L1 7" stroke="#332f30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <div className="w-[13px] h-[13px] bg-white rounded-[3px] border border-[#acaaa5] flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-[13px] h-[13px] rounded-[3px] border-[#acaaa5] cursor-pointer"
                              checked={group.selected}
                              onChange={() => toggleGroupSelection(group.id)}
                              style={{ margin: 0, padding: 0 }}
                            />
                          </div>
                        </div>
                        <div className="text-[16px] leading-[25.2px] text-[#32302f] font-medium" style={{ fontFamily: "'Futura PT', sans-serif" }}>
                          {group.name}
                        </div>
                      </div>
                      <div className="flex gap-[110px] items-center h-full">
                        <div className="flex items-end justify-center overflow-hidden w-[75px]">
                          <div className="text-[14px] leading-[16px] text-[#332f30] text-center" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                            {formatMoney(groupAssigned)}
                          </div>
                        </div>
                        <div className="flex items-end justify-center overflow-hidden w-[75px]">
                          <div className="text-[14px] leading-[16px] text-[#332f30] text-center" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                            {formatMoney(groupActivity)}
                          </div>
                        </div>
                        <div className="flex items-end justify-center overflow-hidden w-[75px]">
                          <div className="text-[14px] leading-[16px] text-[#332f30] text-center" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                            {formatMoney(groupAvailable)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#e5e7eb]"></div>

                  {/* Category Rows */}
                  {!group.collapsed && group.categories.map(category => {
                    const activity = calculateCategoryActivity(category.name);
                    const available = category.assigned - activity;

                    return (
                      <div key={category.id} className="flex gap-[12px] h-[80px] items-center p-[8px]">
                        <div className={`flex-1 flex items-center justify-between h-full p-[16px] rounded-[8px] ${category.selected ? 'bg-neutral-100' : ''}`}>
                          <div className="flex gap-[8px] items-center">
                            <div className="flex gap-[12px] items-center justify-end w-[35px]">
                              <div className="w-[13px] h-[13px] bg-white rounded-[3px] border border-[#acaaa5] flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  className="w-[13px] h-[13px] rounded-[3px] border-[#acaaa5] cursor-pointer"
                                  checked={category.selected}
                                  onChange={() => toggleCategorySelection(group.id, category.id)}
                                  style={{ margin: 0, padding: 0 }}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-[8px] justify-center">
                              <div className="text-[16px] leading-none text-[#32302f]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                                {category.name}
                              </div>
                              <div className="w-[416px] h-[4px] bg-[#f3eee2] rounded-[16px] shadow-[0px_0px_0px_1px_inset_#ece7da]"></div>
                            </div>
                          </div>
                          <div className="flex gap-[110px] items-center h-full">
                            <div className="flex items-end justify-center overflow-hidden w-[75px]">
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
                                  className="w-full text-center px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px] leading-[16px]"
                                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}
                                  placeholder="$0.00"
                                />
                              ) : (
                                <div
                                  onClick={() => setFocusedCategory(category.id)}
                                  className="cursor-text text-[14px] leading-[16px] text-[#332f30] text-center"
                                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}
                                >
                                  {formatMoney(category.assigned || 0)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-end justify-center overflow-hidden w-[75px]">
                              <div className="text-[14px] leading-[16px] text-[#332f30] text-center" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                                {formatMoney(activity)}
                              </div>
                            </div>
                            <div className="flex items-end justify-center overflow-hidden w-[75px]">
                              <div className="text-[14px] leading-[16px] text-[#332f30] text-center" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400 }}>
                                {formatMoney(available)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Fixed (Plan View Only) */}
        <div className="flex flex-col gap-[16px] w-full max-w-[350px] shrink-0 h-screen overflow-y-auto">
        <div className="bg-white rounded-[8px] flex flex-col">
          <div className="p-[16px]">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold leading-[21px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                September's Summary
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="#191818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="px-[16px] py-[16px] flex flex-col gap-[20px] border-t border-[rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Left Over from Last Month
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Assigned in September
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Activity
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="flex items-center justify-between pt-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Available
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[8px] rounded-[6.4px]">
              <div className="pt-[21px] pb-[16px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Cost to Be Me
                </div>
              </div>
              <div className="flex items-center justify-between pb-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  September's Targets
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between pt-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  September's Spending
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between pt-[8px] pb-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Difference
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>

              <div className="pt-[21px] pb-[16px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Cash Flow
                </div>
              </div>
              <div className="flex items-center justify-between pb-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Income for September
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between pt-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Assigned in September
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between pt-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Activity
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>
              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>
              <div className="flex items-center justify-between pt-[8px] pb-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Net Cash Flow
                </div>
                <div className="text-[14px] font-semibold leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  $0.00
                </div>
              </div>

              <div className="h-[1px] w-full bg-[rgba(0,0,0,0.1)]"></div>

              <div className="pt-[21px] pb-[16px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#191818' }}>
                  Age of Money
                </div>
              </div>
              <div className="flex flex-col gap-[8px] pb-[8px]">
                <div className="text-[14px] font-medium leading-[16.8px]" style={{ fontFamily: "'Figtree', sans-serif", color: '#51504d' }}>
                  Not enough information
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </React.Fragment>
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
                <React.Fragment>
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
                </React.Fragment>
              ) : (
                <React.Fragment>
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
                </React.Fragment>
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
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default App;
