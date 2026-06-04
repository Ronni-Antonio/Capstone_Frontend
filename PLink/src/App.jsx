import React, { useState } from 'react';
import Login from './Pages/Login.jsx';

import { Sidebar } from './pages/sidebar';
import { Header } from './pages/header';
import { MachineMonitoring } from './pages/machine_monitoring';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('machines');

  const renderPageContent = () => {
    switch (activePage) {
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

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
      />
    );
  }

  // DASHBOARD
  return (
    <div className="flex min-h-screen bg-[#f4f6f3] overflow-x-hidden">
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