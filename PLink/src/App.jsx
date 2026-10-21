import { Suspense, lazy, useEffect, useState } from 'react';
import api from './api.jsx';
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4fcfc] px-5 text-center font-sans">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-[6px] border-[#bedef6] border-t-[#112d68] rounded-full animate-spin mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-[#112d68]">Loading Plink...</h2>
        <p className="text-sm text-[#112d68]/70 mt-2">Getting your recycling data ready</p>
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
    <div className="min-h-screen bg-[#f4fcfc]">
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
            <Suspense fallback={<div className="p-6 sm:p-8 text-[#112d68]/70">Loading page...</div>}>
              {renderPageContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  // Keep authentication across browser refreshes. The access token is already
  // stored in localStorage by Login.jsx; on startup we verify that token with
  // Laravel before deciding whether to show the login screen.
  const [authStatus, setAuthStatus] = useState('checking'); // checking | authenticated | guest
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('ACCESS_TOKEN');

      if (!token) {
        if (!cancelled) setAuthStatus('guest');
        return;
      }

      try {
        // /api/user is protected by auth:sanctum in the current backend.
        // A successful response proves the saved token is still valid.
        const response = await api.getCurrentUser();
        const user = response.data;

        if (user) {
          if (user.id !== undefined && user.id !== null) {
            localStorage.setItem('plink_user_id', String(user.id));
          }
          if (user.name || user.full_name) {
            localStorage.setItem('plink_user_name', user.name || user.full_name);
          }
          if (user.email) {
            localStorage.setItem('plink_user_email', user.email);
          }
        }

        if (!cancelled) setAuthStatus('authenticated');
      } catch (error) {
        console.error('Unable to restore saved login session:', error);

        // Do not keep a token that Laravel no longer accepts.
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('plink_user_id');
        localStorage.removeItem('plink_user_name');
        localStorage.removeItem('plink_user_email');

        if (!cancelled) setAuthStatus('guest');
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Revoke the current Sanctum token on the backend when possible.
      await api.logout();
    } catch (error) {
      // Local logout should still complete if the server/network is unavailable.
      console.warn('Server logout failed; clearing the local session anyway.', error);
    } finally {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('plink_user_id');
      localStorage.removeItem('plink_user_name');
      localStorage.removeItem('plink_user_email');
      setAuthStatus('guest');
    }
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
          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[rgba(190,222,246,0.4)] shadow-sm">
            <h2 className="text-xl font-bold capitalize text-[#112d68]">{activePage}</h2>
            <p className="mt-2 text-sm text-[#112d68]/70">This screen tab view is successfully linked!</p>
          </div>
        );
    }
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4fcfc] px-5 text-center font-sans">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-[6px] border-[#bedef6] border-t-[#112d68] rounded-full animate-spin mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-[#112d68]">Restoring your session...</h2>
        <p className="text-sm text-[#112d68]/70 mt-2">Checking your saved login securely</p>
      </div>
    );
  }

  if (authStatus !== 'authenticated') {
    return <Login onLogin={() => setAuthStatus('authenticated')} />;
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
