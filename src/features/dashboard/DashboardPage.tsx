/* ──────────────────────────────────────────────
 *  DashboardPage – renders role-specific overview
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import AdminOverview from './AdminOverview';
import UserDashboard from './UserDashboard';

const DashboardPage = () => {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return isAdmin ? <AdminOverview /> : <UserDashboard />;
};

export default DashboardPage;
