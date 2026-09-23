import { BellIcon, MenuIcon } from 'lucide-react';

const titles = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of recycling activity today' },
  machines: { title: 'Machine Monitoring', subtitle: 'Real-time fullness & rejected item tracking' },
  students: { title: 'Student Points', subtitle: 'Manage Grade 3 student rewards & records' },
  rankings: { title: 'Sections Ranking', subtitle: 'See which Grade 3 section leads the eco race' },
  reports: { title: 'Reports & Analytics', subtitle: 'Insights & exportable recycling reports' },
  incentives: { title: 'Incentives & Rewards', subtitle: 'Manage student reward distributions and gift items' },
  notifications: { title: 'Notifications', subtitle: 'System alerts and machine warnings' },
  users: { title: 'User Management', subtitle: 'Profile, security & account activity' },
  settings: { title: 'Settings', subtitle: 'Customize your Plink system' },
  logs: { title: 'Logs', subtitle: 'Activity tracking and redemption management' },
};

export function Header({ activePage, setActivePage, onOpenMobile }) {
  const meta = titles[activePage] || titles.machines;

  return (
    <header className="w-full flex items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 font-sans select-none min-w-0">
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden w-10 h-10 shrink-0 rounded-xl border border-[#dbe6db] bg-white flex items-center justify-center shadow-sm active:scale-95 transition"
          aria-label="Open navigation"
        >
          <MenuIcon className="w-5 h-5 text-[#2d4a33]" />
        </button>

        <div className="min-w-0">
          <h1 className="m-0 text-xl sm:text-2xl lg:text-3xl font-bold text-[#2d4a33] tracking-tight break-words">
            {meta.title}
          </h1>
          <p className="m-0 mt-1 text-xs sm:text-sm font-medium text-[#7a947e] leading-snug">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <button
        onClick={() => setActivePage('notifications')}
        className="relative w-10 h-10 shrink-0 rounded-xl border border-[#dbe6db] bg-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 active:scale-95 transition"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 text-[#2d4a33]" />
        <span className="absolute -top-1.5 -right-1.5 bg-[#f04444] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[14px] text-center">
          3
        </span>
      </button>
    </header>
  );
}
