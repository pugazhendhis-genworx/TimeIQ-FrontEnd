/* ──────────────────────────────────────────────
 *  Application routes
 * ────────────────────────────────────────────── */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { SignupPage, LoginPage, ForgotPasswordPage } from '../features/auth';
import { DashboardPage } from '../features/dashboard';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/signup', element: <SignupPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
