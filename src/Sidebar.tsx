import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

interface Plan {
  id: string;
  name: string;
  lastUsed: string;
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
  showBudgetMenu: boolean;
  plans: Plan[];
  onNewPlanClick: () => void;
  onOpenPlan: (planId: string) => void;
  onViewAllPlans: () => void;
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
  showBudgetMenu,
  plans,
  onNewPlanClick,
  onOpenPlan,
  onViewAllPlans,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({
    cash: true,
    credit: true,
    loans: true,
    tracking: true,
  });
  const [sidebarWidth, setSidebarWidth] = useState(275);
  const [isResizing, setIsResizing] = useState(false);
  const [openPlanOpen, setOpenPlanOpen] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(275);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const budgetButtonRef = useRef<HTMLButtonElement>(null);
  const budgetMenuRef = useRef<HTMLDivElement>(null);
  const openPlanTriggerRef = useRef<HTMLDivElement>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Close budget menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showBudgetMenu && 
          budgetMenuRef.current && 
          budgetButtonRef.current &&
          !budgetMenuRef.current.contains(e.target as Node) &&
          !budgetButtonRef.current.contains(e.target as Node)) {
        onBudgetMenuClick(); // Toggle to close
      }
    };

    if (showBudgetMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBudgetMenu, onBudgetMenuClick]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      
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
      className="relative flex flex-col gap-[32px] h-full bg-[#fdfcfc] overflow-y-auto overflow-x-visible pt-[16px] px-[8px]"
      style={{ width: `${sidebarWidth}px`, minWidth: '275px' }}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-[16px]">
        {/* Budget Name Header */}
        <button
          ref={budgetButtonRef}
          onClick={onBudgetMenuClick}
          className="flex items-center justify-between p-[8px] hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex flex-col gap-[4px] text-left">
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

        {/* Budget Menu Dropdown */}
        <div 
          ref={budgetMenuRef}
          className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-visible transition-all duration-300 ease-in-out"
          style={{
            maxHeight: showBudgetMenu ? '500px' : '0px',
            opacity: showBudgetMenu ? 1 : 0,
            marginBottom: showBudgetMenu ? '0px' : '-16px',
            pointerEvents: showBudgetMenu ? 'auto' : 'none',
          }}
        >
          <div className="transition-all duration-300 overflow-visible rounded-[16px]">
            <div className="p-[8px]">
              <button
                onClick={onNewPlanClick}
                className="w-full flex items-center gap-3 px-[16px] py-[16px] hover:bg-gray-50 rounded-[8px] text-left transition-colors"
              >
                <span className="font-medium text-gray-900" style={{ fontFamily: "'Futura PT', sans-serif" }}>
                  New Plan
                </span>
              </button>
            </div>

            <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />

            <div className="p-[8px]">
              <div
                ref={openPlanTriggerRef}
                className="relative w-full flex items-center justify-between px-[16px] py-[16px] hover:bg-gray-50 rounded-[8px] cursor-pointer transition-colors"
                onMouseEnter={() => {
                  console.log('Mouse entered Open Plan');
                  // Clear any pending close timeout
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  if (openPlanTriggerRef.current) {
                    const rect = openPlanTriggerRef.current.getBoundingClientRect();
                    setSubmenuPosition({
                      top: rect.top,
                      left: rect.right + 8
                    });
                  }
                  setOpenPlanOpen(true);
                }}
                onMouseLeave={() => {
                  console.log('Mouse left Open Plan');
                  // Delay closing to allow mouse to move into submenu
                  closeTimeoutRef.current = setTimeout(() => {
                    setOpenPlanOpen(false);
                  }, 150);
                }}
                onClick={() => {
                  console.log('Clicked Open Plan, current state:', openPlanOpen);
                  setOpenPlanOpen(v => !v);
                }}
              >
                <span className="font-medium" style={{ fontFamily: "'Futura PT', sans-serif", color: textColor }}>
                  Open Plan
                </span>
                <div className="transform rotate-180">
                  <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                    <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {openPlanOpen && ReactDOM.createPortal(
                <div 
                  className="fixed bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] w-64"
                  style={{
                    top: `${submenuPosition.top}px`,
                    left: `${submenuPosition.left}px`,
                    zIndex: 99999,
                    animation: 'slideIn 0.2s ease-out',
                  }}
                  onMouseEnter={() => {
                    // Clear any pending close timeout when entering submenu
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setOpenPlanOpen(true);
                  }}
                  onMouseLeave={() => {
                    // Close immediately when leaving submenu
                    setOpenPlanOpen(false);
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: borderColor }}>
                    <div className="text-xs font-medium text-gray-500" style={{ fontFamily: "'Futura PT', sans-serif" }}>
                      Recent Plans
                    </div>
                  </div>
                  <div className="p-[8px] max-h-60 overflow-auto">
                    {plans.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500" style={{ fontFamily: "'Futura PT', sans-serif" }}>
                        No plans yet
                      </div>
                    ) : (
                      plans.slice(0, 6).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onOpenPlan(p.id)}
                          className="w-full flex items-center px-[16px] py-[16px] hover:bg-gray-50 rounded-[8px] text-left transition-colors"
                        >
                          <span className="text-[16px] font-medium" style={{ fontFamily: "'Futura PT', sans-serif", color: textColor }}>
                            {p.name}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                  <div className="p-[8px]">
                    <button
                      onClick={onViewAllPlans}
                      className="w-full flex items-center px-[16px] py-[16px] hover:bg-gray-50 rounded-[8px] text-left transition-colors"
                    >
                      <span className="text-[16px] font-medium" style={{ fontFamily: "'Futura PT', sans-serif", color: textColor }}>
                        View all plans
                      </span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>

      {/* Navigation Card */}
        <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
          {navItems.map((item, index) => {
            const isActive = activeView === item.key && !selectedAccount;
            return (
              <React.Fragment key={item.key}>
                <div className="box-border flex gap-[12px] h-[80px] items-center p-[8px]">
                  <button
                    onClick={() => onViewChange(item.key)}
                    className={`flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] p-[16px] transition-colors rounded-[8px] ${
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
                </div>
                {index < navItems.length - 1 && (
                  <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Accounts Section */}
      <div className="flex flex-col gap-[16px]">
        <div 
          className="text-[26px] font-medium leading-[32px]" 
          style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
        >
          Accounts
        </div>

        {/* Empty State - No Accounts */}
        {accounts.length === 0 && (
          <>
            <div className="bg-white box-border flex flex-col gap-[24px] items-start p-[8px] rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] w-full">
              <div className="bg-[#ecf2f6] box-border flex flex-col gap-[8px] items-start p-[16px] rounded-[8px] w-full">
                <div 
                  className="text-[18px] font-medium leading-[25.2px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                >
                  No accounts
                </div>
                <div 
                  className="text-[14.9px] leading-[22px] tracking-[-0.08px]" 
                  style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 400, color: textColor }}
                >
                  Click the button below to add an account and get started on your plan.
                </div>
              </div>
            </div>
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
          </>
        )}

        {/* Cash Accounts */}
        {accounts.filter((a) => a.group === 'cash').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="box-border flex gap-[12px] h-[80px] items-center p-[8px]">
              <button
                onClick={() => toggleGroup('cash')}
                className="flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] px-[16px] py-[8px] hover:bg-gray-50 transition-colors"
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
                <div className="flex items-center gap-[16px]">
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
            </div>
            
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: expandedGroups.cash ? `${(accounts.filter((a) => a.group === 'cash').length * 81) + 1}px` : '0px',
              }}
            >
              <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
              {accounts.filter((a) => a.group === 'cash').map((account) => (
                <div key={account.id} className="box-border flex gap-[12px] h-[80px] items-center px-[8px] py-[4px]">
                  <button
                    onClick={() => onAccountClick(account)}
                    className={`flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] p-[16px] transition-colors rounded-[8px] ${
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit Accounts */}
        {accounts.filter((a) => a.group === 'credit').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="box-border flex gap-[12px] h-[80px] items-center p-[8px]">
              <button
                onClick={() => toggleGroup('credit')}
                className="flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] px-[16px] py-[8px] hover:bg-gray-50 transition-colors"
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
                <div className="flex items-center gap-[16px]">
                  <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-[12px] py-[4px] rounded-[100px]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                    {formatMoney(accounts.filter((a) => a.group === 'credit').reduce((sum, a) => sum + a.balance, 0))}
                  </div>
                  <div className={`transform transition-transform ${expandedGroups.credit ? 'rotate-90' : '-rotate-90'}`}>
                    <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                      <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: expandedGroups.credit ? `${(accounts.filter((a) => a.group === 'credit').length * 81) + 1}px` : '0px',
              }}
            >
              <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
              {accounts.filter((a) => a.group === 'credit').map((account) => (
                <div key={account.id} className="box-border flex gap-[12px] h-[80px] items-center px-[8px] py-[4px]">
                  <button
                    onClick={() => onAccountClick(account)}
                    className={`flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] p-[16px] transition-colors rounded-[8px] ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-[12px] py-[4px] rounded-[100px]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loans Accounts */}
        {accounts.filter((a) => a.group === 'loans').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="box-border flex gap-[12px] h-[80px] items-center p-[8px]">
              <button
                onClick={() => toggleGroup('loans')}
                className="flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] px-[16px] py-[8px] hover:bg-gray-50 transition-colors"
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
                <div className="flex items-center gap-[16px]">
                  <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-[12px] py-[4px] rounded-[100px]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                    {formatMoney(accounts.filter((a) => a.group === 'loans').reduce((sum, a) => sum + a.balance, 0))}
                  </div>
                  <div className={`transform transition-transform ${expandedGroups.loans ? 'rotate-90' : '-rotate-90'}`}>
                    <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                      <path d="M1 1L3 4L1 7" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: expandedGroups.loans ? `${(accounts.filter((a) => a.group === 'loans').length * 81) + 1}px` : '0px',
              }}
            >
              <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
              {accounts.filter((a) => a.group === 'loans').map((account) => (
                <div key={account.id} className="box-border flex gap-[12px] h-[80px] items-center px-[8px] py-[4px]">
                  <button
                    onClick={() => onAccountClick(account)}
                    className={`flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] p-[16px] transition-colors rounded-[8px] ${
                      selectedAccount?.id === account.id ? 'bg-neutral-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="text-[16px] font-medium leading-[25.2px]" 
                      style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500, color: textColor }}
                    >
                      {account.name}
                    </div>
                    <div className="bg-[#e05f4d] text-white text-[16px] font-medium leading-[19.2px] px-[12px] py-[4px] rounded-[100px]" style={{ fontFamily: "'Futura PT', sans-serif", fontWeight: 500 }}>
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracking Accounts */}
        {accounts.filter((a) => a.group === 'tracking').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="box-border flex gap-[12px] h-[80px] items-center p-[8px]">
              <button
                onClick={() => toggleGroup('tracking')}
                className="flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] px-[16px] py-[8px] hover:bg-gray-50 transition-colors"
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
                <div className="flex items-center gap-[16px]">
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
            </div>
            
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: expandedGroups.tracking ? `${(accounts.filter((a) => a.group === 'tracking').length * 81) + 1}px` : '0px',
              }}
            >
              <div className="h-[1px] w-full" style={{ backgroundColor: borderColor }} />
              {accounts.filter((a) => a.group === 'tracking').map((account) => (
                <div key={account.id} className="box-border flex gap-[12px] h-[80px] items-center px-[8px] py-[4px]">
                  <button
                    onClick={() => onAccountClick(account)}
                    className={`flex-1 box-border flex items-center justify-between min-h-[1px] min-w-[1px] p-[16px] transition-colors rounded-[8px] ${
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Account Button - Only show if there are accounts */}
        {accounts.length > 0 && (
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
        )}
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