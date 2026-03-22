/* ──────────────────────────────────────────────
 *  Admin Dashboard Overview – stats + charts + recent users
 * ────────────────────────────────────────────── */
import { useMemo } from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import StatsCard from './components/StatsCard';
import Badge from '../../components/common/Badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const AdminOverview = () => {
  const { users, roles } = useAppSelector((s) => s.dashboard);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const recent = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 8);

  const roleBarData = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach((u) => {
      const r = u.role || 'unknown';
      m.set(r, (m.get(r) ?? 0) + 1);
    });
    return [...m.entries()].map(([name, count]) => ({ name, count }));
  }, [users]);

  const statusPie = useMemo(() => {
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const other = users.length - active;
    return [
      { name: 'Active', value: active, color: '#16a34a' },
      { name: 'Other', value: other, color: '#94a3b8' },
    ].filter((d) => d.value > 0);
  }, [users]);

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Admin dashboard</h3>
          <p className="page-header__subtitle">
            User base health, role distribution, and recent signups.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total users" value={users.length} />
        <StatsCard label="Active users" value={activeCount} />
        <StatsCard label="Role types" value={roles.length} />
      </div>

      <div className="dashboard-chart-grid">
        <div className="insight-card">
          <h4 className="insight-card__title">Users by role</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={roleBarData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={48} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="insight-card">
          <h4 className="insight-card__title">Account status</h4>
          {statusPie.length === 0 ? (
            <div className="no-data" style={{ padding: '2rem' }}>No users yet</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={86}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={28} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="table-wrap feature-surface" style={{ marginTop: '1.25rem' }}>
        <div className="table-toolbar">
          <strong className="section-title-inline">Recent users</strong>
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
