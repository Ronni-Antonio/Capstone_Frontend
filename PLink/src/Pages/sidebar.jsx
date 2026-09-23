import { useEffect, useState } from 'react';
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
  ScrollTextIcon,
  XIcon,
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { key: 'machines', label: 'Machine Monitoring', icon: CpuIcon },
  { key: 'students', label: 'Student Points', icon: UsersIcon },
  { key: 'rankings', label: 'Sections Ranking', icon: TrophyIcon },
  { key: 'reports', label: 'Reports & Analytics', icon: BarChart3Icon },
  { key: 'incentives', label: 'Incentives & Rewards', icon: GiftIcon },
  { key: 'logs', label: 'Logs', icon: ScrollTextIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon, badge: 3 },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

function SidebarContent({ activePage, setActivePage, onLogout, collapsed = false, onToggleCollapse, mobile = false, onCloseMobile }) {
  const [userName, setUserName] = useState(() => localStorage.getItem('plink_user_name') || 'Ms. Reyes');

  useEffect(() => {
    const handleNameSync = () => setUserName(localStorage.getItem('plink_user_name') || 'Ms. Reyes');
    window.addEventListener('storage', handleNameSync);
    window.addEventListener('plink-profile-updated', handleNameSync);
    return () => {
      window.removeEventListener('storage', handleNameSync);
      window.removeEventListener('plink-profile-updated', handleNameSync);
    };
  }, []);

  const navigate = (key) => {
    setActivePage(key);
    onCloseMobile?.();
  };

  return (
    <>
      <div className={`px-4 sm:px-6 pt-5 sm:pt-7 pb-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <LeafIcon className="w-5 h-5 text-[#c7eabb]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-sans font-bold text-lg leading-tight whitespace-nowrap">Plink</div>
              <div className="text-xs text-[#c7eabb]/80 leading-tight whitespace-nowrap">Recycling Admin</div>
            </div>
          )}
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-[#c7eabb]"
            aria-label="Close navigation"
          >
            <XIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleCollapse?.(!collapsed)}
            className={`w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#c7eabb] transition-colors ${
              collapsed ? 'absolute -right-4 top-8 bg-[#3e5f44] border border-[#c7eabb]/20 shadow-sm' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpenIcon className="w-4 h-4" /> : <PanelLeftCloseIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className={`px-4 pb-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => navigate('users')}
          title={collapsed ? `${userName} (Profile)` : undefined}
          className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer w-full ${
            collapsed ? 'justify-center w-12 h-12' : 'px-3 py-2.5'
          } ${activePage === 'users' ? 'bg-[#5a7c61] text-white' : 'text-[#c7eabb]/90 hover:bg-white/5 hover:text-white'}`}
        >
          <UserCircleIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 text-left truncate">{userName}</span>}
        </button>
      </div>

      <nav className="flex-1 px-4 pb-3 space-y-1 overflow-y-auto overscroll-contain" aria-label="Main navigation">
        {!collapsed && (
          <div className="px-3 pt-4 pb-2 text-[11px] uppercase tracking-wider text-[#c7eabb]/60 font-semibold">Menu</div>
        )}
        {collapsed && <div className="pt-4" />}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative border-none cursor-pointer w-full min-h-11 ${
                collapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-3 py-2.5'
              } ${isActive ? 'bg-[#5a7c61] text-white' : 'text-[#c7eabb]/90 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="text-[10px] font-bold bg-[#e8f5bd] text-[#3e5f44] px-1.5 py-0.5 rounded-full shrink-0">{item.badge}</span>
              )}
              {item.badge && collapsed && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#e8f5bd]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 border-none cursor-pointer text-[#c7eabb]/90 hover:bg-white/5 hover:text-white min-h-11 ${
            collapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full px-3 py-2.5 text-left'
          }`}
        >
          <LogOutIcon className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="flex-1 whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </>
  );
}

export function Sidebar({ activePage, setActivePage, onLogout, collapsed, setCollapsed, mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen fixed top-0 left-0 bg-[#3e5f44] text-white transition-all duration-300 z-30 overflow-visible ${
          collapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        <SidebarContent
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={onLogout}
          collapsed={collapsed}
          onToggleCollapse={setCollapsed}
        />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(86vw,320px)] bg-[#3e5f44] text-white flex flex-col shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={onLogout}
            mobile
            onCloseMobile={onCloseMobile}
          />
        </aside>
      </div>
    </>
  );
}
