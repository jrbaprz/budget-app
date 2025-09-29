import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Target, TrendingUp, Building, Star, Link, FileText, RotateCcw, RotateCw, Check, MoreHorizontal, HelpCircle } from 'lucide-react';

const App = () => {
  // State Management
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1));
  const [activeView, setActiveView] = useState('Plan');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filterTab, setFilterTab] = useState('All');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [allCategoriesSelected, setAllCategoriesSelected] = useState(false);
  const [focusedCategory, setFocusedCategory] = useState(null);
  
  // Account Data
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Chequing', balance: 500.00, type: 'cash', clearedBalance: 500.00, unclearedBalance: 0 },
    { id: 2, name: 'Savings', balance: 0.00, type: 'cash', clearedBalance: 0.00, unclearedBalance: 0 },
    { id: 3, name: 'Credit Card', balance: -100.00, type: 'credit', clearedBalance: -100.00, unclearedBalance: 0 }
  ]);

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
  const [newAccount, setNewAccount] = useState({ name: '', type: 'cash', balance: '' });
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
      .filter(acc => acc.type === 'cash')
      .reduce((sum, acc) => sum + acc.balance, 0);
    
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
    if (newAccount.name) {
      const balance = parseFloat(newAccount.balance) || 0;
      const newAcct = {
        id: accounts.length + 1,
        name: newAccount.name,
        type: newAccount.type,
        balance: balance,
        clearedBalance: balance,
        unclearedBalance: 0
      };
      setAccounts([...accounts, newAcct]);
      
      if (balance !== 0) {
        setTransactions(prev => ({
          ...prev,
          [newAcct.id]: [{
            id: 1,
            date: new Date().toLocaleDateString('en-US'),
            payee: 'Starting Balance',
            category: balance > 0 ? 'Inflow: Ready to Assign' : '',
            memo: '',
            outflow: balance < 0 ? Math.abs(balance) : null,
            inflow: balance > 0 ? balance : null,
            cleared: true
          }]
        }));
      } else {
        setTransactions(prev => ({ ...prev, [newAcct.id]: [] }));
      }
      
      setNewAccount({ name: '', type: 'cash', balance: '' });
      setShowAddAccount(false);
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
    assigned: { textAlign: 'right', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' },
    activity: { textAlign: 'right', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' },
    available: { textAlign: 'right', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', fontWeight: '500' }
  };

  // Sidebar Styles
  const sidebarStyle = {
    backgroundColor: '#1D1F58',
    width: '256px'
  };

  const activeButtonStyle = {
    backgroundColor: '#393B6B'
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div style={sidebarStyle} className="text-white flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">Budget</div>
                <div className="text-xs opacity-75">perezcipolab@gmail.com</div>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-75 cursor-pointer hover:opacity-100" />
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
              <span className="text-xs uppercase opacity-50 tracking-wider">Cash</span>
              <span className="text-sm font-medium">
                ${accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter(a => a.type === 'cash').map(account => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium">${account.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase opacity-50 tracking-wider">Credit</span>
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                -${Math.abs(accounts.filter(a => a.type === 'credit').reduce((sum, a) => sum + a.balance, 0)).toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {accounts.filter(a => a.type === 'credit').map(account => (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-white/10"
                  style={selectedAccount?.id === account.id ? activeButtonStyle : {}}
                >
                  <span className="text-sm">{account.name}</span>
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                    -${Math.abs(account.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddAccount(true)}
            className="mt-6 flex items-center gap-2 text-sm opacity-75 hover:opacity-100 transition-opacity w-full px-3 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
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
                      <tr className="border-b" style={{ backgroundColor: '#F8F6F2' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F0EDE6'} onMouseLeave={(e) => e.target.style.backgroundColor = '#F8F6F2'}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h2 className="text-xl font-semibold mb-4">Add Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddAccount(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addAccount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
