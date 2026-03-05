/* ──────────────────────────────────────────────
 *  DashboardPage – renders role-specific overview
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import AdminOverview from './AdminOverview';
import OperationExecutiveOverview from './OperationExecutiveOverview';
import UserDashboard from './UserDashboard';

const DashboardPage = () => {
  const { user } = useAppSelector((s) => s.auth);
  const role = user?.role?.toLowerCase();

  if (role === 'admin') return <AdminOverview />;
  if (role === 'operation_executive') return <OperationExecutiveOverview />;
  return <UserDashboard />;
};

export default DashboardPage;
