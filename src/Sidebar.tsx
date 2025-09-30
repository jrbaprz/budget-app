import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

// SVG icon imports (inline for now, can be extracted later)
const PlanIcon = () => (
  <svg width="23" height="19" viewBox="0 0 23 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H21M2 9.5H21M2 17H21" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ReflectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18V6C2 3.79086 3.79086 2 6 2H14C16.2091 2 18 3.79086 18 6V18M2 18H18M2 18H0M18 18H20" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const AllAccountsIcon = () => (
  <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 9H20M1 1H20M1 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
  const navItems = [
    { key: 'Plan', label: 'Plan', icon: <PlanIcon /> },
    { key: 'Reflect', label: 'Reflect', icon: <ReflectIcon /> },
    { key: 'AllAccounts', label: 'All accounts', icon: <AllAccountsIcon /> },
  ];

  return (
    <div className="flex flex-col gap-[54px] w-[350px] h-full bg-[#fdfcfc] px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Budget Name Header */}
        <button
          onClick={onBudgetMenuClick}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex flex-col gap-1 text-left">
            <div className="text-[26px] font-semibold leading-none text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
              {budgetName}
            </div>
            <div className="text-[16px] leading-none text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 400 }}>
              {email}
            </div>
          </div>
          <ChevronDown className="w-[13px] h-[8px] text-[#332f30]" />
        </button>

        {/* Navigation Card */}
        <div className="bg-white rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] px-2 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = activeView === item.key && !selectedAccount;
            return (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className={`flex items-center gap-3 p-4 rounded-md transition-colors ${
                  isActive ? 'bg-[#f6f6f6]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-[22px] h-[19px] text-[#332f30]">{item.icon}</div>
                <div className="text-[16px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accounts Section */}
      <div className="flex flex-col gap-4">
        <div className="text-[20px] font-semibold leading-none text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
          Accounts
        </div>

        {/* Cash Accounts */}
        {accounts.filter((a) => a.group === 'cash').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-[16px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                Cash
              </div>
              <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                {formatMoney(accounts.filter((a) => a.group === 'cash').reduce((sum, a) => sum + a.balance, 0))}
              </div>
            </div>
            <div className="h-[1px] bg-gray-200" />
            {accounts.filter((a) => a.group === 'cash').map((account, index, arr) => (
              <React.Fragment key={account.id}>
                <button
                  onClick={() => onAccountClick(account)}
                  className={`flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors ${
                    selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                    {account.name}
                  </div>
                  <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                    {formatMoney(account.balance)}
                  </div>
                </button>
                {index < arr.length - 1 && <div className="h-[1px] bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Credit Accounts */}
        {accounts.filter((a) => a.group === 'credit').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-[16px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                Credit
              </div>
              <div className="bg-[#e05f4d] text-white text-[14px] font-semibold leading-[19.2px] px-3 py-0.5 rounded-full" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                {formatMoney(accounts.filter((a) => a.group === 'credit').reduce((sum, a) => sum + a.balance, 0))}
              </div>
            </div>
            <div className="h-[1px] bg-gray-200" />
            {accounts.filter((a) => a.group === 'credit').map((account) => (
              <button
                key={account.id}
                onClick={() => onAccountClick(account)}
                className={`flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {account.name}
                </div>
                <div className="bg-[#e05f4d] text-white text-[14px] font-semibold leading-[19.2px] px-3 py-0.5 rounded-full" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {formatMoney(account.balance)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loans Accounts */}
        {accounts.filter((a) => a.group === 'loans').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-[16px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                Loans
              </div>
              <div className="bg-[#e05f4d] text-white text-[14px] font-semibold leading-[19.2px] px-3 py-0.5 rounded-full" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                {formatMoney(accounts.filter((a) => a.group === 'loans').reduce((sum, a) => sum + a.balance, 0))}
              </div>
            </div>
            <div className="h-[1px] bg-gray-200" />
            {accounts.filter((a) => a.group === 'loans').map((account) => (
              <button
                key={account.id}
                onClick={() => onAccountClick(account)}
                className={`flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {account.name}
                </div>
                <div className="bg-[#e05f4d] text-white text-[14px] font-semibold leading-[19.2px] px-3 py-0.5 rounded-full" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {formatMoney(account.balance)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tracking Accounts */}
        {accounts.filter((a) => a.group === 'tracking').length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-[16px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                Tracking
              </div>
              <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                {formatMoney(accounts.filter((a) => a.group === 'tracking').reduce((sum, a) => sum + a.balance, 0))}
              </div>
            </div>
            <div className="h-[1px] bg-gray-200" />
            {accounts.filter((a) => a.group === 'tracking').map((account) => (
              <button
                key={account.id}
                onClick={() => onAccountClick(account)}
                className={`flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedAccount?.id === account.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {account.name}
                </div>
                <div className="text-[14px] font-semibold leading-[19.2px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
                  {formatMoney(account.balance)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Add Account Button */}
        <button
          onClick={onAddAccount}
          className="bg-[#f0eeef] rounded-full px-4 py-2 flex items-center justify-center gap-2 hover:bg-[#e8e6e7] transition-colors"
        >
          <PlusIcon />
          <div className="text-[14px] font-semibold leading-[16.8px] text-[#332f30]" style={{ fontFamily: "'PP Mori', sans-serif", fontWeight: 600 }}>
            Add an account
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;