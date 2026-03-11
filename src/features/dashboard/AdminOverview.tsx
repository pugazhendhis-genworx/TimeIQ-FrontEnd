/* ──────────────────────────────────────────────
 *  Admin Dashboard Overview – stats + recent users
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';

const AdminOverview = () => {
  const { users, roles } = useAppSelector((s) => s.dashboard);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const recent = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Dashboard</h3>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Users" value={users.length} />
        <StatsCard label="Active Users" value={activeCount} />
        <StatsCard label="Roles" value={roles.length} />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <strong style={{ fontSize: '0.85rem' }}>Recent Users</strong>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data">
                  No users yet
                </td>
              </tr>
            ) : (
              recent.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role}>{u.role || '—'}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.status}>{u.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminOverview;
