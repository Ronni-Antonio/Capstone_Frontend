import { Suspense, lazy, useState, useEffect } from 'react';
import Login from './Pages/Login.jsx';

import { Sidebar } from './Pages/sidebar.jsx';
import { Header } from './Pages/header.jsx';



import { DataProvider, useData } from './context/DataContext.jsx';


const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));
const Reports = lazy(() => import('./Pages/Reports.jsx'));
const StudentPoints = lazy(() => import('./Pages/student_points.jsx'));
const SectionsRanking = lazy(() => import('./Pages/sections_ranking.jsx'));
const IncentivesRewards = lazy(() => import('./Pages/incentives_rewards.jsx'));
const Profile = lazy(() => import('./Pages/profile.jsx'));
const MachineMonitoring = lazy(() => import('./Pages/machine_monitoring.jsx').then((m) => ({ default: m.MachineMonitoring })));
const Notifications = lazy(() => import('./Pages/notifications.jsx').then((m) => ({ default: m.Notifications })));
const Settings = lazy(() => import('./Pages/Settings.jsx').then((m) => ({ default: m.Settings })));
const Logs = lazy(() => import('./Pages/Logs.jsx').then((m) => ({ default: m.Logs })));

// App content component that uses data context
function AppContent({ activePage, setActivePage, handleLogout, sidebarCollapsed, renderPageContent }) {
  const { isLoading, error } = useData();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f7f8f3'
      }}>
        {/* Animated spinner */}
        <div style={{
          width: '80px',
          height: '80px',
          border: '6px solid #c7eabb',
          borderTop: '6px solid #3e5f44',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        <h2 style={{
          color: '#3e5f44',
          fontSize: '28px',
          fontWeight: '700',
          margin: 0
        }}>
          Loading Plink...
        </h2>
        <p style={{
          color: 'rgba(62,95,68,0.7)',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          Getting your recycling data ready
        </p>
        {/* Add keyframe animation style */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#b91c1c'
      }}>
        Error: {error}
      </div>
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
          <Suspense fallback={<div className="p-8 text-[#3e5f44]/70">Loading page...</div>}>
            {renderPageContent()}
          </Suspense>
        </div>
      </div>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    
    localStorage.removeItem('ACCESS_TOKEN');

    setIsLoggedIn(false);
    
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

      case 'logs':
        return <Logs />;

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
    <DataProvider>
      <AppContent
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
        renderPageContent={renderPageContent}
      />
    </DataProvider>
  );
}

export default App;