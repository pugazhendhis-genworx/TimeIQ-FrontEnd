/* ──────────────────────────────────────────────
 *  Application routes – role-based dashboard
 * ────────────────────────────────────────────── */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';
import { SignupPage, LoginPage, ForgotPasswordPage } from '../features/auth';
import {
  DashboardPage,
  UserManagement,
  RolesPage,
  ProfilePage,
} from '../features/dashboard';
import { EmailListPage } from '../features/email';
import { TimesheetListPage, ExtractedTimesheetPage } from '../features/timesheet';
import { ExtractedTimesheetsPage } from '../features/extracted';
import { PaycodeManagement } from '../features/paycode';
import { AuditorDashboard, AuditorTimesheetPage, AuditLogsPage } from '../features/audit';
import { RuleViolationsPage } from '../features/rule-violations';
import { PayrollReadyPage } from '../features/payroll-ready';
import { ClientConfigPage } from '../features/client-config';
import { WorkforcePage } from '../features/workforce';

const router = createBrowserRouter([
  /* ── Public auth routes ────────────────────── */
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/signup', element: <SignupPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  /* ── Protected dashboard routes ────────────── */
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        /* RoleGuard checks the user's role against routePermissions */
        element: <RoleGuard />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/dashboard/users', element: <UserManagement /> },
              { path: '/dashboard/roles', element: <RolesPage /> },
              { path: '/dashboard/client-config', element: <ClientConfigPage /> },
              { path: '/dashboard/workforce', element: <WorkforcePage /> },
              { path: '/dashboard/emails', element: <EmailListPage /> },
              { path: '/dashboard/timesheets', element: <TimesheetListPage /> },
              {
                path: '/dashboard/extracted-timesheets/:timesheetId',
                element: <ExtractedTimesheetPage />,
              },
              { path: '/dashboard/payroll', element: <PaycodeManagement /> },
              { path: '/dashboard/rule-violations', element: <RuleViolationsPage /> },
              { path: '/dashboard/payroll-ready', element: <PayrollReadyPage /> },
              { path: '/dashboard/extracted-timesheets', element: <ExtractedTimesheetsPage /> },
              { path: '/dashboard/audit', element: <AuditorDashboard /> },
              {
                path: '/dashboard/audit-timesheets',
                element: <AuditorTimesheetPage />,
              },
              { path: '/dashboard/audit-logs', element: <AuditLogsPage /> },
              { path: '/dashboard/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  /* ── Catch-all ─────────────────────────────── */
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
