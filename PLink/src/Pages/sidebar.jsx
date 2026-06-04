import React from 'react';

const COLORS = {
  dark: '#3e5f44',
  white: '#ffffff',
  mint: '#c7eabb',
  mintMuted: 'rgba(199, 234, 187, 0.8)',
  sage: '#5a7c61',
  lime: '#e8f5bd',
  hoverBg: 'rgba(255, 255, 255, 0.05)',
};

export function Sidebar({ activePage, setActivePage }) {
  
  const getNavItemStyles = (pageName) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: activePage === pageName ? COLORS.sage : 'transparent',
    color: activePage === pageName ? COLORS.white : COLORS.mintMuted,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  });

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: '260px',
      flexShrink: 0,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: COLORS.dark,
      color: COLORS.white,
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      zIndex: 10
    }}>
      
      {/* Header Logo */}
      <div style={{ padding: '28px 24px 24px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '16px', backgroundColor: 'rgba(199, 234, 187, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Font Awesome Leaf Icon for Logo */}
          <i className="fa-solid fa-leaf" style={{ color: COLORS.mint, fontSize: '18px' }}></i>
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '18px', lineHeight: '1.2' }}>Plink</div>
          <div style={{ fontSize: '12px', color: COLORS.mintMuted, lineHeight: '1.2' }}>Recycling Admin</div>
        </div>
      </div>

      {/* Profile Button */}
      <div style={{ padding: '0 16px 8px 16px' }}>
        <button onClick={() => setActivePage('users')} style={getNavItemStyles('users')}>
          <i className="fa-solid fa-circle-user" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Ms. Reyes</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div style={{ padding: '16px 12px 8px 12px', fontSize: '11px', textTransform: 'uppercase', color: 'rgba(199, 234, 187, 0.6)', fontWeight: '600' }}>
          Menu
        </div>

        {/* Dashboard */}
        <button onClick={() => setActivePage('dashboard')} style={getNavItemStyles('dashboard')}>
          <i className="fa-solid fa-chart-simple" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Dashboard</span>
        </button>

        {/* Machine Monitoring */}
        <button onClick={() => setActivePage('machines')} style={getNavItemStyles('machines')}>
          <i className="fa-solid fa-microchip" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Machine Monitoring</span>
        </button>

        {/* Student Points */}
        <button onClick={() => setActivePage('students')} style={getNavItemStyles('students')}>
          <i className="fa-solid fa-graduation-cap" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Student Points</span>
        </button>

        {/* Sections Ranking */}
        <button onClick={() => setActivePage('rankings')} style={getNavItemStyles('rankings')}>
          <i className="fa-solid fa-trophy" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Sections Ranking</span>
        </button>

        {/* Reports & Analytics */}
        <button onClick={() => setActivePage('reports')} style={getNavItemStyles('reports')}>
          <i className="fa-solid fa-chart-line" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Reports & Analytics</span>
        </button>

        {/* Notifications */}
        <button onClick={() => setActivePage('notifications')} style={getNavItemStyles('notifications')}>
          <i className="fa-solid fa-bell" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Notifications</span>
          <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: COLORS.lime, color: COLORS.dark, padding: '2px 6px', borderRadius: '9999px' }}>3</span>
        </button>

        {/* Settings */}
        <button onClick={() => setActivePage('settings')} style={getNavItemStyles('settings')}>
          <i className="fa-solid fa-gear" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Settings</span>
        </button>
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px' }}>
        <button onClick={() => alert('Logging out...')} style={getNavItemStyles('logout')}>
          <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}></i>
          <span style={{ flex: 1 }}>Logout</span>
        </button>
      </div>

    </aside>
  );
}