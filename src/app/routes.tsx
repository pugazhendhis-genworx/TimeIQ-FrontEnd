/* ──────────────────────────────────────────────
 *  Application routes – role-based dashboard
 * ────────────────────────────────────────────── */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { SignupPage, LoginPage, ForgotPasswordPage } from '../features/auth';
import {
  DashboardPage,
  UserManagement,
  RolesPage,
  ProfilePage,
} from '../features/dashboard';
import { ClientManagement } from '../features/client';
import { WhitelistManagement } from '../features/whitelist';
import { EmployeeManagement } from '../features/employee';
import { EmailListPage, TimesheetEmailPage } from '../features/email';
import { TimesheetListPage, ExtractedTimesheetPage } from '../features/timesheet';
import { ExtractedTimesheetsPage } from '../features/extracted';
import { AssignmentManagement } from '../features/assignment';
import { PaycodeManagement } from '../features/paycode';
import { AuditorDashboard, AuditorTimesheetPage, AuditLogsPage } from '../features/audit';
// Assignment and Payroll features will be added under these routes

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
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/dashboard/users', element: <UserManagement /> },
          { path: '/dashboard/roles', element: <RolesPage /> },
          { path: '/dashboard/clients', element: <ClientManagement /> },
          { path: '/dashboard/whitelist', element: <WhitelistManagement /> },
          { path: '/dashboard/employees', element: <EmployeeManagement /> },
          { path: '/dashboard/emails', element: <EmailListPage /> },
          { path: '/dashboard/timesheet-emails', element: <TimesheetEmailPage /> },
          { path: '/dashboard/timesheets', element: <TimesheetListPage /> },
          {
            path: '/dashboard/extracted-timesheets/:timesheetId',
            element: <ExtractedTimesheetPage />,
          },
          { path: '/dashboard/assignments', element: <AssignmentManagement /> },
          { path: '/dashboard/payroll', element: <PaycodeManagement /> },
          { path: '/dashboard/extracted-timesheets', element: <ExtractedTimesheetsPage /> },
          // assignments and payroll routes are now handled above
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
  /* ── Catch-all ─────────────────────────────── */
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
