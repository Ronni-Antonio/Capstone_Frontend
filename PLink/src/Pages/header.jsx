
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
};

export function Header({ activePage, setActivePage }) {

  const meta = titles[activePage] || titles.machines;

  return (
    <header className="w-full flex items-center justify-between pb-4 font-sans select-none">
      
      {/* 1. Left Section: Page Titles */}
      <div>
        <h1 className="m-0 text-3xl font-bold text-[#2d4a33] tracking-tight">
          {meta.title}
        </h1>
        <p className="m-0 mt-1 text-sm font-medium text-[#7a947e]">
          {meta.subtitle}
        </p>
      </div>

      {/* 2. Right Section: Actions Panel */}
      <div className="flex items-center gap-3.5">
        

        {/* Notifications Icon Button */}
        <button
          onClick={() => setActivePage('notifications')}
          className="relative w-10 h-10 rounded-xl border border-[#dbe6db] bg-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
        >
          <i className="fa-solid fa-bell text-[#2d4a33] text-base"></i>
          <span className="absolute -top-1.5 -right-1.5 bg-[#f04444] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[14px] text-center structure-badge">
            3
          </span>
        </button>

      </div>
    </header>
  );
}