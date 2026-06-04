import React, { useState } from 'react';

const titles = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of recycling activity today' },
  machines: { title: 'Machine Monitoring', subtitle: 'Real-time fullness & rejected item tracking' },
  students: { title: 'Student Points', subtitle: 'Manage Grade 3 student rewards & records' },
  rankings: { title: 'Sections Ranking', subtitle: 'See which Grade 3 section leads the eco race' },
  reports: { title: 'Reports & Analytics', subtitle: 'Insights & exportable recycling reports' },
  notifications: { title: 'Notifications', subtitle: 'System alerts and machine warnings' },
  users: { title: 'User Management', subtitle: 'Profile, security & account activity' },
  settings: { title: 'Settings', subtitle: 'Customize your Plink system' },
};

export function Header({ activePage, setActivePage }) {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
        
        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-white border border-[#dbe6db] rounded-full px-4 py-2 w-64 shadow-sm">
          <i className="fa-solid fa-magnifying-glass text-[#7a947e] text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                setActivePage('students');
              }
            }}
            placeholder="Search students, machines..."
            className="bg-transparent border-none outline-none text-sm text-[#2d4a33] w-full font-sans placeholder:text-[#7a947e]/60"
          />
        </div>

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

        {/* User Account Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 bg-white border border-[#dbe6db] rounded-full pl-1 pr-3.5 py-1 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#7da47d] text-white flex items-center justify-center text-xs font-bold">
              MR
            </div>
            
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#2d4a33] line-clamp-1">
                Ms. Reyes
              </div>
              <div className="text-[10px] text-[#9cb5a0] font-medium leading-none">
                Admin
              </div>
            </div>

            <i className="fa-solid fa-chevron-down text-[#7a947e] text-[10px] ml-0.5"></i>
          </button>

          {/* Simple Dropdown Card Menu */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#dbe6db] rounded-xl shadow-md p-1 min-w-[130px] flex flex-col z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <button 
                  onClick={() => { setMenuOpen(false); setActivePage('users'); }}
                  className="px-3 py-1.5 text-left bg-transparent border-none cursor-pointer text-[#2d4a33] text-xs font-semibold hover:bg-[#f4f6f3] rounded-lg"
                >
                  Profile
                </button>
                <button 
                  onClick={() => { setMenuOpen(false); setActivePage('settings'); }}
                  className="px-3 py-1.5 text-left bg-transparent border-none cursor-pointer text-[#2d4a33] text-xs font-semibold hover:bg-[#f4f6f3] rounded-lg"
                >
                  Settings
                </button>
                <div className="h-px bg-[#ebebeb] my-1 mx-1" />
                <button 
                  onClick={() => { setMenuOpen(false); localStorage.removeItem('plink_role'); alert('Logged out'); }}
                  className="px-3 py-1.5 text-left bg-transparent border-none cursor-pointer text-[#dc2626] text-xs font-bold hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}