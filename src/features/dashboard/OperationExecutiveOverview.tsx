/* ──────────────────────────────────────────────
 *  Operation Executive Dashboard Overview
 *  Shows client statistics with room for future KPIs
 * ────────────────────────────────────────────── */
import { useAppSelector } from '../../hooks/reduxHooks';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';

const OperationExecutiveOverview = () => {
  const { clients } = useAppSelector((s) => s.client);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.is_active).length;
  const inactiveClients = totalClients - activeClients;

  /* Recent clients – latest 5 by created_at */
  const recent = [...clients]
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

      {/* ── Stats cards ─────────────────────────── */}
      <div className="stats-grid">
        <StatsCard label="Total Clients" value={totalClients} />
        <StatsCard label="Active Clients" value={activeClients} />
        <StatsCard label="Inactive Clients" value={inactiveClients} />
        {/* Future stats slots — add more <StatsCard /> here */}
      </div>

      {/* ── Recent clients table ────────────────── */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <strong style={{ fontSize: '0.85rem' }}>Recent Clients</strong>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Code</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data">
                  No clients yet
                </td>
              </tr>
            ) : (
              recent.map((c) => (
                <tr key={c.client_id}>
                  <td style={{ fontWeight: 600 }}>{c.client_name}</td>
                  <td>
                    <span className="client-code-cell">{c.client_code}</span>
                  </td>
                  <td>{c.client_email}</td>
                  <td>
                    <Badge variant={c.is_active ? 'active' : 'inactive'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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

export default OperationExecutiveOverview;
