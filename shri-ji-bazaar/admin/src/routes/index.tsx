import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { Login } from '../pages/auth/Login';
import { useAuthStore } from '../store/authStore';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Users } from '../pages/users/Users';
import { Games } from '../pages/games/Games';
import { Rounds } from '../pages/rounds/Rounds';
import { Results } from '../pages/results/Results';
import { Activities } from '../pages/activities/Activities';
import { Points } from '../pages/points/Points';
import { Bonuses } from '../pages/bonuses/Bonuses';
import { Referrals } from '../pages/referrals/Referrals';
import { Notifications } from '../pages/notifications/Notifications';
import { Support } from '../pages/support/Support';
import { Banners } from '../pages/banners/Banners';
import { Settings } from '../pages/settings/Settings';
import { AuditLogs } from '../pages/audit-logs/AuditLogs';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const routes = [
  { path: '/login', element: <Login />, public: true },
  {
    path: '/',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'games', element: <Games /> },
      { path: 'rounds', element: <Rounds /> },
      { path: 'results', element: <Results /> },
      { path: 'activities', element: <Activities /> },
      { path: 'points', element: <Points /> },
      { path: 'bonuses', element: <Bonuses /> },
      { path: 'referrals', element: <Referrals /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'support', element: <Support /> },
      { path: 'banners', element: <Banners /> },
      { path: 'settings', element: <Settings /> },
      { path: 'audit-logs', element: <AuditLogs /> },
      { index: true, element: <Navigate to="/dashboard" replace /> },
    ],
  },
];
