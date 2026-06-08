import React, { useState } from 'react';
import Login from './Pages/Login.jsx';

import { Sidebar } from './Pages/sidebar';
import { Header } from './Pages/header';

import Dashboard from './Pages/Dashboard.jsx';
import Reports from './Pages/Reports.jsx';

import { MachineMonitoring } from './Pages/machine_monitoring';
import { Notifications } from './Pages/notifications';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;

      case 'reports':
        return <Reports />;

      case 'machines':
        return <MachineMonitoring />;

      case 'notifications':
        return (
          <Notifications onNavigate={setActivePage} />
        );

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
    <div className="min-h-screen bg-[#f7f8f3]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="ml-[260px] w-[calc(100%-260px)] min-h-screen flex flex-col p-10">
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