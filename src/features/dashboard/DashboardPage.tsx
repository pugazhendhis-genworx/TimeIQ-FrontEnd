/* ──────────────────────────────────────────────
 *  DashboardPage – renders role-specific overview
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import AdminOverview from './AdminOverview';
import OperationExecutiveOverview from './OperationExecutiveOverview';
import UserDashboard from './UserDashboard';
import { AuditorDashboard } from '../audit';

const DashboardPage = () => {
  const { user } = useAppSelector((s) => s.auth);
  const role = user?.role?.toLowerCase();

  if (role === 'admin') return <AdminOverview />;
  if (role === 'operation_executive') return <OperationExecutiveOverview />;
  if (role === 'auditor') return <AuditorDashboard />;
  return <UserDashboard />;
};

export default DashboardPage;
