import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

// New icons matching Figma design
const OverviewIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12.5H11M2.24977 9.78775V7.07549M6 9.78775V7.07549M9.75023 9.78775V7.07549M6 1.5L11 4.51422H1L6 1.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlanIcon = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7.27778C6.75776 7.27778 7.48449 6.97341 8.02031 6.43164C8.55612 5.88987 8.85714 5.15507 8.85714 4.38889C8.85714 3.62271 8.55612 2.88791 8.02031 2.34614C7.48449 1.80436 6.75776 1.5 6 1.5C5.24224 1.5 4.51551 1.80436 3.97969 2.34614C3.44388 2.88791 3.14286 3.62271 3.14286 4.38889C3.14286 5.15507 3.44388 5.88987 3.97969 6.43164C4.51551 6.97341 5.24224 7.27778 6 7.27778ZM1 13.0556C1 12.2894 1.30102 11.5546 1.83684 11.0128C2.37266 10.471 3.09938 10.1667 3.85714 10.1667H8.14286C8.90062 10.1667 9.62734 10.471 10.1632 11.0128C10.699 11.5546 11 12.2894 11 13.0556V13.7778C11 13.9693 10.9247 14.153 10.7908 14.2885C10.6568 14.4239 10.4752 14.5 10.2857 14.5H1.71429C1.52485 14.5 1.34316 14.4239 1.20921 14.2885C1.07526 14.153 1 13.9693 1 13.7778V13.0556Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
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
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      // Enforce minimum width of 275px
      if (newWidth >= 275) {
        setSidebarWidth(newWidth);
      } else {
        setSidebarWidth(275);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const navItems = [
    { key: 'Overview', label: 'Overview', icon: <OverviewIcon /> },
    { key: 'Plan', label: 'Plan', icon: <PlanIcon /> },
  ];

  const textColor = '#32302f';
  const borderColor = '#e4e2e1';

  return (
    <div 
      ref={sidebarRef}
      className="relative flex flex-col gap-[32px] h-full bg-[#fdfcfc] px-4 py-6"
      style={{ width: `${sidebarWidth}px` }}
    >
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
              className="text-[14px] leading-[22px]" 
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
        <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
          {navItems.map((item, index) => {
            const isActive = activeView === item.key && !selectedAccount;
            return (
              <React.Fragment key={item.key}>
                <button
                  onClick={() => onViewChange(item.key)}
                  className={`flex items-center justify-between w-full h-[80px] px-[24px] transition-colors ${
                    isActive ? 'bg-neutral-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="text-[16px] font-medium leading-[25.2px]" 
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
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <button
              onClick={() => toggleGroup('cash')}
              className="flex items-center justify-between w-full h-[80px] px-[24px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Cash
                </div>
                <div 
                  className="text-[14px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'cash').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
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
                    className={`flex items-center justify-between w-full h-[80px] px-[24px] transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
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
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <button
              onClick={() => toggleGroup('credit')}
              className="flex items-center justify-between w-full h-[80px] px-[24px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Credit
                </div>
                <div 
                  className="text-[14px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'credit').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
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
                    className={`flex items-center justify-between w-full h-[80px] px-[24px] transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
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
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <button
              onClick={() => toggleGroup('loans')}
              className="flex items-center justify-between w-full h-[80px] px-[24px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Loans
                </div>
                <div 
                  className="text-[14px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'loans').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
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
                    className={`flex items-center justify-between w-full h-[80px] px-[24px] transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-3 py-1 rounded-full" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
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
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <button
              onClick={() => toggleGroup('tracking')}
              className="flex items-center justify-between w-full h-[80px] px-[24px] hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start gap-0">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  Tracking
                </div>
                <div 
                  className="text-[14px] leading-[22px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  {accounts.filter((a) => a.group === 'tracking').length} accounts
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="text-[16px] font-medium leading-[25.2px]" 
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
                    className={`flex items-center justify-between w-full h-[80px] px-[24px] transition-colors ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
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
            className="text-[16px] font-medium leading-[18px]" 
            style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
          >
            Add an account
          </div>
        </button>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 bottom-0 w-3 cursor-col-resize"
        style={{
          right: '-6px', // Position so handle is centered on the sidebar edge
        }}
      >
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors"
          style={{
            background: isResizing ? '#3B82F6' : 'transparent',
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;