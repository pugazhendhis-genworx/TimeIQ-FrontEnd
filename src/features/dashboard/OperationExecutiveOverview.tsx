/* ──────────────────────────────────────────────
 *  Operation Executive Dashboard Overview
 *  Stats cards + recent emails, timesheet emails,
 *  timesheets moved to approval, and recent clients
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTimesheetsThunk } from '../timesheet/timesheetSlice';
import { fetchEmailsThunk } from '../email/emailSlice';
import { fetchAssignmentsThunk } from '../assignment/assignmentSlice';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

const statusLabelMap: Record<string, string> = {
  RECEIVED: 'Received',
  EXTRACTED: 'Extracted',
  MATCHED: 'Matched',
  UNMATCHED: 'Unmatched',
  READY_FOR_APPROVAL: 'Ready for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const OperationExecutiveOverview = () => {
  const dispatch = useAppDispatch();
  const { clients } = useAppSelector((s) => s.client);
  const { emails } = useAppSelector((s) => s.email);
  const { timesheets } = useAppSelector((s) => s.timesheet);
  const { assignments } = useAppSelector((s) => s.assignment);

  useEffect(() => {
    dispatch(fetchTimesheetsThunk());
    dispatch(fetchEmailsThunk());
    dispatch(fetchAssignmentsThunk());
  }, [dispatch]);

  /* ── Computed stats ──────────────────────────── */
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.is_active).length;
  const totalTimesheets = timesheets.length;
  const pendingApproval = timesheets.filter((t) => t.status === 'READY_FOR_APPROVAL').length;
  const approvedTimesheets = timesheets.filter((t) => t.status === 'APPROVED').length;
  const totalEmails = emails.length;
  const timesheetEmails = emails.filter((e) => e.classification === 'timesheet');
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.is_active).length;

  /* ── Recent items (latest 5 each) ──────────── */
  const recentEmails = [...emails]
    .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
    .slice(0, 5);

  const recentTimesheetEmails = [...timesheetEmails]
    .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
    .slice(0, 5);

  const recentApproval = [...timesheets]
    .filter((t) => t.status === 'READY_FOR_APPROVAL' || t.status === 'APPROVED')
    .sort((a, b) => {
      const dA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dB - dA;
    })
    .slice(0, 5);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
        <StatsCard label="Total Emails" value={totalEmails} />
        <StatsCard label="Timesheet Emails" value={timesheetEmails.length} />
        <StatsCard label="Total Timesheets" value={totalTimesheets} />
        <StatsCard label="Pending Approval" value={pendingApproval} />
        <StatsCard label="Approved" value={approvedTimesheets} />
        <StatsCard label="Active Assignments" value={`${activeAssignments} / ${totalAssignments}`} />
      </div>

      {/* ── Recent Activity Panels ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>

        {/* Recent Emails */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <strong style={{ fontSize: '0.85rem' }}>Recent Emails</strong>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {recentEmails.length === 0 ? (
                <tr><td colSpan={4} className="no-data">No emails yet</td></tr>
              ) : (
                recentEmails.map((e) => (
                  <tr key={e.email_message_id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmt(e.received_at)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{e.sender_email}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.subject ?? '—'}
                    </td>
                    <td>
                      <Badge variant={e.classification === 'timesheet' ? 'active' : 'info'}>
                        {e.classification ?? '—'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Timesheet Emails */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <strong style={{ fontSize: '0.85rem' }}>Recent Timesheet Emails</strong>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTimesheetEmails.length === 0 ? (
                <tr><td colSpan={4} className="no-data">No timesheet emails yet</td></tr>
              ) : (
                recentTimesheetEmails.map((e) => (
                  <tr key={e.email_message_id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmt(e.received_at)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{e.sender_email}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.subject ?? '—'}
                    </td>
                    <td>
                      <Badge variant={e.processed_status === 'success' ? 'active' : 'info'}>
                        {e.processed_status ?? '—'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Moved to Approval / Recently Approved */}
        <div className="table-wrap">
          <div className="table-toolbar">
            <strong style={{ fontSize: '0.85rem' }}>Approval Pipeline</strong>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timesheet</th>
                <th>Client</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentApproval.length === 0 ? (
                <tr><td colSpan={4} className="no-data">No timesheets in approval pipeline</td></tr>
              ) : (
                recentApproval.map((t) => {
                  const clientName =
                    clients.find((c) => c.client_id === t.client_id)?.client_name ?? '—';
                  return (
                    <tr key={t.timesheet_id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {t.timesheet_id.slice(0, 8)}…
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{clientName}</td>
                      <td>
                        <Badge variant={t.status === 'APPROVED' ? 'active' : 'info'}>
                          {statusLabelMap[t.status] ?? t.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmt(t.updated_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Clients */}
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
              {recentClients.length === 0 ? (
                <tr><td colSpan={4} className="no-data">No clients yet</td></tr>
              ) : (
                recentClients.map((c) => (
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
      </div>
    </>
  );
};

export default OperationExecutiveOverview;
