import React, { useEffect, useState } from 'react';
import {
  LayoutDashboardIcon,
  CpuIcon,
  UsersIcon,
  TrophyIcon,
  BarChart3Icon,
  BellIcon,
  SettingsIcon,
  LeafIcon,
  LogOutIcon,
  GiftIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UserCircleIcon,
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { key: 'machines', label: 'Machine Monitoring', icon: CpuIcon },
  { key: 'students', label: 'Student Points', icon: UsersIcon },
  { key: 'rankings', label: 'Sections Ranking', icon: TrophyIcon },
  { key: 'reports', label: 'Reports & Analytics', icon: BarChart3Icon },
  { key: 'incentives', label: 'Incentives & Rewards', icon: GiftIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon, badge: 3 },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar({ activePage, setActivePage, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('plink_sidebar_collapsed');
    return saved === 'true';
  });

  // --- ADDED STATE FOR DYNAMIC NAME MATCHING ---
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('plink_user_name') || 'Ms. Reyes';
  });

  useEffect(() => {
    localStorage.setItem('plink_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // --- LISTEN FOR REAL-TIME CHANGES FROM PROFILE WORKERS ---
  useEffect(() => {
    const handleNameSync = () => {
      setUserName(localStorage.getItem('plink_user_name') || 'Ms. Reyes');
    };

    window.addEventListener('storage', handleNameSync);
    return () => window.removeEventListener('storage', handleNameSync);
  }, []);

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-screen fixed top-0 left-0 bg-[#3e5f44] text-white transition-all duration-300 z-10 overflow-hidden ${
        collapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      {/* 1. Header Logo */}
      <div className={`px-6 pt-7 pb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <LeafIcon className="w-5 h-5 text-[#c7eabb]" />
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <div className="font-sans font-bold text-lg leading-tight whitespace-nowrap">Plink</div>
              <div className="text-xs text-[#c7eabb]/80 leading-tight whitespace-nowrap">Recycling Admin</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#c7eabb] transition-colors ${
            collapsed ? 'absolute -right-4 top-8 bg-[#3e5f44] border border-[#c7eabb]/20 shadow-sm' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpenIcon className="w-4 h-4" /> : <PanelLeftCloseIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. User Account Button */}
      <div className={`px-4 pb-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => setActivePage('users')}
          title={collapsed ? `${userName} (Profile)` : undefined} // Updated dynamic fallback title
          className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer w-full ${
            collapsed ? 'justify-center w-12 h-12' : 'px-3 py-2.5'
          } ${activePage === 'users' ? 'bg-[#5a7c61] text-white' : 'text-[#c7eabb]/90 hover:bg-white/5 hover:text-white'}`}
        >
          <UserCircleIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 text-left whitespace-nowrap">{userName}</span>} {/* Dynamic variable replaces Ms. Reyes */}
        </button>
      </div>

      {/* 3. Dynamic Navigation Loop */}
      <nav className="flex-1 px-4 space-y-1 overflow-hidden" aria-label="Main navigation">
        {!collapsed && (
          <div className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider text-[#c7eabb]/60 font-semibold transition-opacity duration-300">
            Menu
          </div>
        )}
        {collapsed && <div className="pt-4" />}
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative border-none cursor-pointer w-full ${
                collapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-2.5'
              } ${isActive ? 'bg-[#5a7c61] text-white' : 'text-[#c7eabb]/90 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-left whitespace-nowrap transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              {item.badge && !collapsed && (
                <span className="text-[10px] font-bold bg-[#e8f5bd] text-[#3e5f44] px-1.5 py-0.5 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
              {item.badge && collapsed && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#e8f5bd]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Logout Section */}
      <div className="p-4">
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer text-[#c7eabb]/90 hover:bg-white/5 hover:text-white ${
            collapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-3 py-2.5 text-left'
          }`}
        >
          <LogOutIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 whitespace-nowrap transition-opacity duration-300">Logout</span>}
        </button>
      </div>
    </aside>
  );
}