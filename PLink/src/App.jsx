import React, { useState, useEffect } from 'react';
import Login from './Pages/Login.jsx';

import { Sidebar } from './Pages/sidebar.jsx';
import { Header } from './Pages/header.jsx';

import Dashboard from './Pages/Dashboard.jsx';
import Reports from './Pages/Reports.jsx';

import { MachineMonitoring } from './Pages/machine_monitoring.jsx';
import { Notifications } from './Pages/notifications.jsx';
import { Settings } from './Pages/Settings.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // Track sidebar collapse state globally to synchronize layout margins
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('plink_sidebar_collapsed');
    return saved === 'true';
  });

  // Keep state matching local storage updates smoothly
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('plink_sidebar_collapsed');
      setSidebarCollapsed(saved === 'true');
    };

    // Listen for local state mutations or clicks
    window.addEventListener('click', handleStorageChange);
    return () => window.removeEventListener('click', handleStorageChange);
  }, []);

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;

      case 'reports':
      case 'reports & analytics': // Matches sidebar text casing smoothly
        return <Reports />;

      case 'machines':
      case 'machine monitoring': // Matches sidebar text casing smoothly
        return <MachineMonitoring />;

      case 'notifications':
        return <Notifications onNavigate={setActivePage} />;

      case 'settings': // Adds your actual settings view case mapping
        return <Settings />;

      default:
        return (
          <div className="bg-white p-8 rounded-3xl border border-[rgba(199,234,187,0.4)] shadow-sm">
            <h2 className="text-xl font-bold capitalize text-[#3e5f44]">
              {activePage}
            </h2>

            <p className="mt-2 text-sm text-[#3e5f44]/70">
              This screen tab view is successfully linked!
            </p>
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8f3] overflow-x-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Margins dynamically scale back and forth smoothly matching the sidebar state */}
      <div 
        className={`min-h-screen flex flex-col p-10 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20 w-[calc(100%-80px)]' : 'ml-[260px] w-[calc(100%-260px)]'
        }`}
      >
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <div className="flex-1 mt-4">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
}

export default App;