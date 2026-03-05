/* ──────────────────────────────────────────────
 *  User Dashboard – for non-admin roles
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import Badge from '../../components/common/Badge';

const UserDashboard = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { users } = useAppSelector((s) => s.dashboard);

  if (!user) return null;

  const fullUser = users.find((u) => u.user_id === user.user_id);
  const name = fullUser?.name ?? user.user_name ?? 'User';

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Dashboard</h3>
      </div>

      <div className="dashboard-welcome">
        <h1 className="dashboard-welcome__heading">Welcome, {name}!</h1>
        <p className="dashboard-welcome__text">
          You have successfully logged in to TimeGuard — your Timesheet Processing
          Assistant.
        </p>
        <p className="dashboard-welcome__hint">
          Start processing timesheets, reviewing extractions, and managing
          approvals.
        </p>

        {fullUser && (
          <div className="profile-card" style={{ marginTop: '2rem' }}>
            <div className="profile-card__row">
              <span className="profile-card__label">Role</span>
              <Badge variant={fullUser.role}>{fullUser.role}</Badge>
            </div>
            <div className="profile-card__row">
              <span className="profile-card__label">Status</span>
              <Badge variant={fullUser.status}>{fullUser.status}</Badge>
            </div>
            <div className="profile-card__row">
              <span className="profile-card__label">Email</span>
              <span>{fullUser.email}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
