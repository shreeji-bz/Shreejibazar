import { lazy } from 'react';
export const AdminRoutes = [
  { path: '/dashboard', element: lazy(() => import('../pages/dashboard/DashboardPage')) },
  { path: '/users', element: lazy(() => import('../pages/users/UsersPage')) },
  { path: '/games', element: lazy(() => import('../pages/games/GamesPage')) },
  { path: '/rounds', element: lazy(() => import('../pages/rounds/RoundsPage')) },
  { path: '/results', element: lazy(() => import('../pages/results/ResultsPage')) },
  { path: '/banners', element: lazy(() => import('../pages/banners/BannersPage')) },
  { path: '/bonuses', element: lazy(() => import('../pages/bonuses/BonusesPage')) },
  { path: '/notifications', element: lazy(() => import('../pages/notifications/NotificationsPage')) },
  { path: '/support', element: lazy(() => import('../pages/support/TicketsPage')) },
  { path: '/settings', element: lazy(() => import('../pages/settings/SettingsPage')) },
  { path: '/audit-logs', element: lazy(() => import('../pages/audit-logs/AuditLogsPage')) },
];
