import { lazy } from 'react';
export const AuthRoutes = [
  { path: '/login', element: lazy(() => import('../pages/auth/LoginPage')) },
  { path: '/forgot-password', element: lazy(() => import('../pages/auth/ForgotPasswordPage')) },
];
