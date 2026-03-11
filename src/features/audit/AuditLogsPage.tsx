/* ──────────────────────────────────────────────
 *  Audit Logs – chronological actions view
 * ────────────────────────────────────────────── */
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchAuditLogsThunk } from './auditSlice';

const AuditLogsPage = () => {
  const dispatch = useAppDispatch();
  const { logs, logsLoading } = useAppSelector((s) => s.audit);
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAuditLogsThunk(undefined));
  }, [dispatch]);

  const filtered = logs.filter((log) =>
    resourceFilter
      ? log.entity_type.toLowerCase() === resourceFilter.toLowerCase()
      : true,
  );

  return (
    <div>
      <div className="page-header">
        <h3 className="page-header__title">Audit Logs</h3>
      </div>
      <div className="table-wrap">
        <div className="table-toolbar">
          <select
            className="table-toolbar__select"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          >
            <option value="">All Resources</option>
            <option value="TIMESHEET">Timesheet</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        {logsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading audit logs…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Resource</th>
                <th>Resource ID</th>
                <th>Action</th>
                <th>Actor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No logs match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.audit_log_id}>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                    <td>{l.entity_type}</td>
                    <td>{l.entity_id}</td>
                    <td>{l.action}</td>
                    <td>{l.user_id || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;

