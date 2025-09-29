import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Target, TrendingUp, Building, Star, Link, FileText, RotateCcw, RotateCw, Check, MoreHorizontal, HelpCircle, Folder, Pencil, Trash2 } from 'lucide-react';

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
  const [plans, setPlans] = useState<{ id: string; name: string; lastUsed: string }[]>([]);
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [openPlanOpen, setOpenPlanOpen] = useState(false);
  const budgetMenuRef = useRef<HTMLDivElement | null>(null);
  const budgetMenuButtonRef = useRef<HTMLButtonElement | null>(null);
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
      if (saved) setPlans(JSON.parse(saved));
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
    setPlans(prev => {
      const exists = prev.find(p => p.name === trimmed);
      const next = exists
        ? prev.map(p => p.name === trimmed ? { ...p, lastUsed: now } : p)
        : [...prev, { id: Date.now().toString(), name: trimmed, lastUsed: now }];
      return next.sort((a,b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
    });
    setBudgetName(trimmed);
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
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Chequing', balance: 500.00, group: 'cash', subtype: 'checking', clearedBalance: 500.00, unclearedBalance: 0 },
    { id: 2, name: 'Savings', balance: 0.00, group: 'cash', subtype: 'savings', clearedBalance: 0.00, unclearedBalance: 0 },
    { id: 3, name: 'Credit Card', balance: -100.00, group: 'credit', subtype: 'credit_card', clearedBalance: -100.00, unclearedBalance: 0 }
  ] as any);

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
      name: 'Credit Card Payments',
      collapsed: false,
      selected: false,
      categories: [{ id: 1, name: 'Credit Card', assigned: 0, selected: false }]
    },
    {
      id: 2,
      name: 'Bills',
      collapsed: false,
      selected: false,
      categories: [
        { id: 2, name: 'Rent/Mortgage', assigned: 0, selected: false },
        { id: 3, name: 'Electric', assigned: 0, selected: false },
        { id: 4, name: 'Water', assigned: 0, selected: false },
        { id: 5, name: 'Internet', assigned: 0, selected: false },
        { id: 6, name: 'Cellphone', assigned: 0, selected: false }
      ]
    },
    {
      id: 3,
      name: 'Frequent',
      collapsed: false,
      selected: false,
      categories: [
        { id: 7, name: 'Groceries', assigned: 0, selected: false },
        { id: 8, name: 'Eating Out', assigned: 0, selected: false },
        { id: 9, name: 'Transportation', assigned: 0, selected: false }
      ]
    },
    {
      id: 4,
      name: 'Non-Monthly',
      collapsed: false,
      selected: false,
      categories: [
        { id: 10, name: 'Home Maintenance', assigned: 0, selected: false },
        { id: 11, name: 'Auto Maintenance', assigned: 0, selected: false },
        { id: 12, name: 'Gifts', assigned: 0, selected: false }
      ]
    },
    {
      id: 5,
      name: 'Goals',
      collapsed: false,
      selected: false,
      categories: [
        { id: 13, name: 'Vacation', assigned: 0, selected: false },
        { id: 14, name: 'Education', assigned: 0, selected: false },
        { id: 15, name: 'Emergency Fund', assigned: 0, selected: false }
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
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const parseCurrency = (value) => {
    return value.replace(/[^0-9.-]/g, '');
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

  // Sidebar Styles
  const sidebarStyle = {
    backgroundColor: '#1D1F58',
    width: '256px'
  };

  const sectionTitle = (label: string) => (
    <span className="text-xs uppercase opacity-50 tracking-wider">{label}</span>
  );

  const activeButtonStyle = {
    backgroundColor: '#393B6B'
  };

  return (
    <>
      {activeView === 'PreBudget' ? (
        <div className="min-h-screen bg-gray-50">
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
                    <div className="text-xs text-gray-500 mt-1">Last used {new Date(p.lastUsed).toLocaleDateString()}</div>
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

          {/* Create Budget Modal */}
          {showCreateBudget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) { setShowCreateBudget(false); } }}>
              <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Create New Plan</h2>
                </div>
                <div className="p-6 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Plan name</label>
                  <input
                    type="text"
                    value={newBudgetName}
                    onChange={(e) => setNewBudgetName(e.target.value)}
                    placeholder="e.g., Household, Business, Vacation"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
                  <button
                    onClick={() => { setShowCreateBudget(false); setNewBudgetName(''); }}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createPlan(newBudgetName)}
                    className="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*       ) : (
        <div className="h-screen flex bg-gray-50" onClick={() => { /* close popovers when clicking main content */ setShowBudgetMenu(false); setOpenPlanOpen(false); }}>
      {/* Left Sidebar */}
      <div style={sidebarStyle} className="text-white flex flex-col">
        <div className="p-4">
          <div className="relative">
            <button
              ref={budgetMenuButtonRef}
              onClick={() => setShowBudgetMenu(v => !v)}
              className="w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">{budgetName}</div>
                  <div className="text-xs opacity-75 text-left">perezcipolab@gmail.com</div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 opacity-75" />
            </button>

            {showBudgetMenu && (
              <div ref={budgetMenuRef} className="absolute left-0 top-full mt-2 bg-white text-gray-900 rounded-lg shadow-xl w-64 z-20">
                <div className="py-2">
                  <button
                    onClick={() => { setShowCreateBudget(true); setShowBudgetMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200">
                      <Plus className="w-4 h-4" />
                    </span>
                    <span className="font-medium">New Plan</span>
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

          <nav className="space-y-1">
            <button
              onClick={() => { setActiveView('Plan'); setSelectedAccount(null); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-white/10"
              style={activeView === 'Plan' && !selectedAccount ? activeButtonStyle : {}}
            >
              <Target className="w-5 h-5" />
              <span className="font-medium">Plan</span>
            </button>
            <button
              onClick={() => { setActiveView('Reflect'); setSelectedAccount(null); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-white/10"
              style={activeView === 'Reflect' ? activeButtonStyle : {}}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Reflect</span>
            </button>
            <button
              onClick={() => { setActiveView('AllAccounts'); setSelectedAccount(null); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-white/10"
              style={activeView === 'AllAccounts' ? activeButtonStyle : {}}
            >
              <Building className="w-5 h-5" />
              <span className="font-medium">All Accounts</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 px-4 overflow-auto">
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {sectionTitle('Cash')}
              <span className="text-sm font-medium text-right">
                ${accounts.filter((a: any) => a.group === 'cash').reduce((sum: number, a: any) => sum + a.balance, 0).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter((a: any) => a.group === 'cash').map((account: any) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium text-right">${account.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {sectionTitle('Credit')}
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-right">
                -${Math.abs(accounts.filter((a: any) => a.group === 'credit').reduce((sum: number, a: any) => sum + a.balance, 0)).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter((a: any) => a.group === 'credit').map((account: any) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-right">
                    -${Math.abs(account.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {sectionTitle('Loans')}
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-right">
                -${Math.abs(accounts.filter((a: any) => a.group === 'loans').reduce((sum: number, a: any) => sum + a.balance, 0)).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter((a: any) => a.group === 'loans').map((account: any) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-right">
                    -${Math.abs(account.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {sectionTitle('Tracking')}
              <span className="text-sm font-medium text-right">
                ${accounts.filter((a: any) => a.group === 'tracking').reduce((sum: number, a: any) => sum + a.balance, 0).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter((a: any) => a.group === 'tracking').map((account: any) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium text-right">${account.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setAddAccountStep('form'); setShowAddAccount(true); }}
            className="mt-6 w-full flex items-center gap-3 text-sm font-medium text-white rounded-2xl px-4 py-2.5 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#1D1F58]">
              <Plus className="w-4 h-4" />
            </span>
            <span>Add Account</span>
          </button>
        </div>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-2 text-sm opacity-75 hover:opacity-100 px-3 py-2">
            <span>❤️</span> Refer a Friend
          </button>
        </div>
      </div>

      {/* Main Content Area - Plan View */}
      {activeView === 'Plan' && !selectedAccount && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
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
                  <div className="text-2xl font-bold">${Math.abs(readyToAssign).toFixed(2)}</div>
                  <div className="text-xs">Ready to Assign</div>
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
              <thead className="bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase sticky top-0">
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
                        <td style={cellStyle.assigned}>${groupAssigned.toFixed(2)}</td>
                        <td style={cellStyle.activity}>${groupActivity.toFixed(2)}</td>
                        <td style={cellStyle.available}>${groupAvailable.toFixed(2)}</td>
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
                            className={`border-b ${category.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                                  {formatCurrency(category.assigned)}
                                </div>
                              )}
                            </td>
                            <td style={cellStyle.activity}>${activity.toFixed(2)}</td>
                            <td style={cellStyle.available}>
                              {isCreditCard ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span style={{ color: isOverspent ? '#DC2626' : available > 0 ? '#16A34A' : '#4B5563' }}>
                                    ${available.toFixed(2)}
                                  </span>
                                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 whitespace-nowrap">
                                    <HelpCircle className="w-3 h-3" />
                                    PAYMENT
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: isOverspent ? '#DC2626' : available > 0 ? '#16A34A' : '#4B5563' }}>
                                  ${available.toFixed(2)}
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
        </div>
      )}
    </>
  );
};

export default App;
