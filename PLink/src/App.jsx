import { Suspense, lazy, useEffect, useState } from 'react';
import Login from './Pages/Login.jsx';
import { Sidebar } from './Pages/sidebar.jsx';
import { Header } from './Pages/header.jsx';
import { DataProvider, useData } from './context/DataContext.jsx';

const Dashboard = lazy(() => import('./Pages/Dashboard.jsx'));
const Reports = lazy(() => import('./Pages/Reports.jsx'));
const StudentPoints = lazy(() => import('./Pages/student_points.jsx'));
const SectionsRanking = lazy(() => import('./Pages/sections_ranking.jsx'));
const IncentivesRewards = lazy(() => import('./Pages/incentives_rewards.jsx'));
const Logs = lazy(() => import('./Pages/Logs.jsx'));
const Profile = lazy(() => import('./Pages/profile.jsx'));
const MachineMonitoring = lazy(() => import('./Pages/machine_monitoring.jsx').then((m) => ({ default: m.MachineMonitoring })));
const Notifications = lazy(() => import('./Pages/notifications.jsx').then((m) => ({ default: m.Notifications })));
const Settings = lazy(() => import('./Pages/Settings.jsx').then((m) => ({ default: m.Settings })));

function AppContent({ activePage, setActivePage, handleLogout, renderPageContent }) {
  const { isLoading, error } = useData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('plink_sidebar_collapsed');
    return saved === 'true';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileNavOpen]);

  const navigate = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const updateSidebarCollapsed = (next) => {
    setSidebarCollapsed(next);
    localStorage.setItem('plink_sidebar_collapsed', String(next));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8f3] px-5 text-center font-sans">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-[6px] border-[#c7eabb] border-t-[#3e5f44] rounded-full animate-spin mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-[#3e5f44]">Loading Plink...</h2>
        <p className="text-sm text-[#3e5f44]/70 mt-2">Getting your recycling data ready</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center font-sans text-base sm:text-lg text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3]">
      <Sidebar
        activePage={activePage}
        setActivePage={navigate}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={updateSidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main
        className="min-h-screen w-full transition-[margin,width] duration-300"
        style={{
          // Tailwind cannot safely generate dynamic arbitrary classes in a production build.
          // Desktop positioning is therefore applied here, while mobile remains full width.
          '--desktop-sidebar-width': sidebarCollapsed ? '80px' : '260px',
        }}
      >
        <div className="app-shell min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
          <Header
            activePage={activePage}
            setActivePage={navigate}
            onOpenMobile={() => setMobileNavOpen(true)}
          />

          <div className="flex-1 mt-4 sm:mt-5 min-w-0">
            <Suspense fallback={<div className="p-6 sm:p-8 text-[#3e5f44]/70">Loading page...</div>}>
              {renderPageContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    setIsLoggedIn(false);
  };

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
        return <Notifications onNavigate={setActivePage} />;
      case 'users':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'logs':
        return <Logs />;
      default:
        return (
          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[rgba(199,234,187,0.4)] shadow-sm">
            <h2 className="text-xl font-bold capitalize text-[#3e5f44]">{activePage}</h2>
            <p className="mt-2 text-sm text-[#3e5f44]/70">This screen tab view is successfully linked!</p>
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DataProvider>
      <AppContent
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
        renderPageContent={renderPageContent}
      />
    </DataProvider>
  );
}

export default App;
