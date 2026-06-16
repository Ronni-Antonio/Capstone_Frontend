import React, { useState, useEffect } from 'react';
import Login from './Pages/Login.jsx';

import { Sidebar } from './Pages/sidebar.jsx';
import { Header } from './Pages/header.jsx';

import Dashboard from './Pages/Dashboard.jsx';
import Reports from './Pages/Reports.jsx';
import StudentPoints from './Pages/student_points.jsx';
import SectionsRanking from './Pages/sections_ranking.jsx';
import IncentivesRewards from './Pages/incentives_rewards.jsx';
import Profile from './Pages/Profile.jsx';

import { MachineMonitoring } from './Pages/machine_monitoring.jsx';
import { Notifications } from './Pages/notifications.jsx';
import { Settings } from './Pages/Settings.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('ACCESS_TOKEN');
  });
  const [activePage, setActivePage] = useState('dashboard');

  console.log('Current isLoggedIn state:', isLoggedIn);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('ACCESS_TOKEN');
    setIsLoggedIn(false);
    console.log('isLoggedIn set to false');
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('plink_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('plink_sidebar_collapsed');
      setSidebarCollapsed(saved === 'true');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;

      case 'students':
        return <StudentPoints />;

      case 'rankings':
        return <SectionsRanking />;

      case 'incentives':
        return <IncentivesRewards />;

      case 'reports':
      case 'reports & analytics':
        return <Reports />;

      case 'machines':
      case 'machine monitoring':
        return <MachineMonitoring />;

      case 'notifications':
        return (
          <Notifications
            onNavigate={setActivePage}
          />
        );

      case 'users':
        return <Profile />;

      case 'settings':
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
        onLogin={() =>
          setIsLoggedIn(true)
        }
      />
    );
  }

  return (
    <>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />

      <div
        className={`min-h-screen flex flex-col p-10 transition-all duration-300 ${
          sidebarCollapsed
            ? 'ml-20 w-[calc(100%-80px)]'
            : 'ml-[260px] w-[calc(100%-260px)]'
        }`}
      >
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={handleLogout}
        />

        <div className="flex-1 mt-4">
          {renderPageContent()}
        </div>
      </div>
    </>
  );
}

export default App;