import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// New icons matching Figma design
const OverviewIcon = () => (
  <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H11M1 6.5H11M1 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlanIcon = () => (
  <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 2C1 1.44772 1.44772 1 2 1H9C9.55228 1 10 1.44772 10 2V13M1 13H10M1 13H0M10 13H11" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface Account {
  id: number;
  name: string;
  balance: number;
  group: string;
}

interface SidebarProps {
  budgetName: string;
  email: string;
  activeView: string;
  accounts: Account[];
  selectedAccount: Account | null;
  onViewChange: (view: string) => void;
  onAccountClick: (account: Account) => void;
  onAddAccount: () => void;
  onBudgetMenuClick: () => void;
  formatMoney: (value: number) => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  budgetName,
  email,
  activeView,
  accounts,
  selectedAccount,
  onViewChange,
  onAccountClick,
  onAddAccount,
  onBudgetMenuClick,
  formatMoney,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({
    cash: true,
    credit: true,
    loans: true,
    tracking: true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navItems = [
    { key: 'Overview', label: 'Overview', icon: <OverviewIcon /> },
    { key: 'Plan', label: 'Plan', icon: <PlanIcon /> },
  ];

  const textColor = '#32302f';
  const borderColor = '#e4e2e1';

  return (
    <div className="flex flex-col gap-[32px] w-[280px] h-full bg-[#fdfcfc] px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Budget Name Header */}
        <button
          onClick={onBudgetMenuClick}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex flex-col gap-1 text-left">
            <div 
              className="text-[26px] font-medium leading-[32px]" 
              style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
            >
              {budgetName}
            </div>
            <div 
              className="text-[14.9px] leading-[22px]" 
              style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
            >
              {email}
            </div>
          </div>
          <div className="transform rotate-90">
            <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
              <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        {/* Navigation Card */}
        <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          {navItems.map((item, index) => {
            const isActive = activeView === item.key && !selectedAccount;
            return (
              <React.Fragment key={item.key}>
                <button
                  onClick={() => onViewChange(item.key)}
                  className={`flex items-center justify-between w-full h-[80px] px-6 transition-colors ${
                    isActive ? 'bg-neutral-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="text-[18px] font-medium leading-[25.2px]" 
                    style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                  >
                    {item.label}
                  </div>
                  <div className="w-[10px] h-[11px] text-[#32302f]">
                    {item.icon}
                  </div>
                </button>
                {index < navItems.length - 1 && (
                  <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Accounts Section */}
      <div className="flex flex-col gap-4">
        <div 
          className="text-[26px] font-medium leading-[32px]" 
          style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
        >
          Accounts
        </div>

        {/* Cash Accounts */}
        {accounts.filter((a) => a.group === 'cash').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
              onClick={() => toggleGroup('cash')}
              className="flex items-center justify-between w-full h-[80px] px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Cash
                </div>
                <div 
                  className="text-[14.9px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'cash').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  {formatMoney(accounts.filter((a) => a.group === 'cash').reduce((sum, a) => sum + a.balance, 0))}
                </div>
                <div className={`transform transition-transform ${expandedGroups.cash ? 'rotate-90' : '-rotate-90'}`}>
                  <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                    <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {expandedGroups.cash && (
              <>
                <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                {accounts.filter((a) => a.group === 'cash').map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onAccountClick(account)}
                    className={`flex items-center justify-between w-full h-[80px] px-6 transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Credit Accounts */}
        {accounts.filter((a) => a.group === 'credit').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
              onClick={() => toggleGroup('credit')}
              className="flex items-center justify-between w-full h-[80px] px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Credit
                </div>
                <div 
                  className="text-[14.9px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'credit').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[#e05f4d] text-white text-[18px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                  {formatMoney(accounts.filter((a) => a.group === 'credit').reduce((sum, a) => sum + a.balance, 0))}
                </div>
                <div className={`transform transition-transform ${expandedGroups.credit ? 'rotate-90' : '-rotate-90'}`}>
                  <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                    <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {expandedGroups.credit && (
              <>
                <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                {accounts.filter((a) => a.group === 'credit').map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onAccountClick(account)}
                    className={`flex items-center justify-between w-full h-[80px] px-6 transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[18px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Loans Accounts */}
        {accounts.filter((a) => a.group === 'loans').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
              onClick={() => toggleGroup('loans')}
              className="flex items-center justify-between w-full h-[80px] px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Loans
                </div>
                <div 
                  className="text-[14.9px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'loans').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[#e05f4d] text-white text-[18px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                  {formatMoney(accounts.filter((a) => a.group === 'loans').reduce((sum, a) => sum + a.balance, 0))}
                </div>
                <div className={`transform transition-transform ${expandedGroups.loans ? 'rotate-90' : '-rotate-90'}`}>
                  <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                    <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {expandedGroups.loans && (
              <>
                <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                {accounts.filter((a) => a.group === 'loans').map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onAccountClick(account)}
                    className={`flex items-center justify-between w-full h-[80px] px-6 transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[18px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tracking Accounts */}
        {accounts.filter((a) => a.group === 'tracking').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_2px_6px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <button
              onClick={() => toggleGroup('tracking')}
              className="flex items-center justify-between w-full h-[80px] px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Tracking
                </div>
                <div 
                  className="text-[14.9px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'tracking').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  {formatMoney(accounts.filter((a) => a.group === 'tracking').reduce((sum, a) => sum + a.balance, 0))}
                </div>
                <div className={`transform transition-transform ${expandedGroups.tracking ? 'rotate-90' : '-rotate-90'}`}>
                  <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                    <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {expandedGroups.tracking && (
              <>
                <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                {accounts.filter((a) => a.group === 'tracking').map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onAccountClick(account)}
                    className={`flex items-center justify-between w-full h-[80px] px-6 transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div 
                      className="text-[18px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Add Account Button */}
        <button
          onClick={onAddAccount}
          className="bg-[rgba(0,0,0,0.06)] rounded-[72px] px-[17px] py-[15px] min-h-[48px] flex items-center justify-center gap-2 hover:bg-[rgba(0,0,0,0.08)] transition-colors"
        >
          <Plus className="w-4 h-4" style={{ color: textColor }} />
          <div 
            className="text-[18px] font-medium leading-[18px]" 
            style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
          >
            Add an account
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;