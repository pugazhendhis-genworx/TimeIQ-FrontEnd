/* ──────────────────────────────────────────────
 *  Application routes – role-based dashboard
 * ────────────────────────────────────────────── */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { SignupPage, LoginPage, ForgotPasswordPage } from '../features/auth';
import {
  DashboardPage,
  UserManagement,
  RolesPage,
  ProfilePage,
} from '../features/dashboard';

const router = createBrowserRouter([
  /* ── Public auth routes ────────────────────── */
  {
    element: <AuthLayout />,
    children: [
      { path: '/signup', element: <SignupPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  /* ── Protected dashboard routes ────────────── */
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/dashboard/users', element: <UserManagement /> },
          { path: '/dashboard/roles', element: <RolesPage /> },
          { path: '/dashboard/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  /* ── Catch-all ─────────────────────────────── */
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
