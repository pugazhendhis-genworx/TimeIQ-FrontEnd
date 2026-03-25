/* ──────────────────────────────────────────────
 *  Operation Executive Dashboard Overview
 *  Stats cards, recent emails, approval pipeline, clients, violations
 * ────────────────────────────────────────────── */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTimesheetsThunk } from '../timesheet/timesheetSlice';
import { fetchEmailsThunk } from '../email/emailSlice';
import { fetchAssignmentsThunk } from '../assignment/assignmentSlice';
import {
  fetchFlaggedTimesheetsThunk,
  fetchViolationDetailThunk,
} from '../rule-violations/ruleViolationSlice';
import StatsCard from './components/StatsCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ViolationSeverityList from '../rule-violations/components/ViolationSeverityList';

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
  const navigate = useNavigate();
  const { clients } = useAppSelector((s) => s.client);
  const { emails } = useAppSelector((s) => s.email);
  const { timesheets } = useAppSelector((s) => s.timesheet);
  const { assignments } = useAppSelector((s) => s.assignment);
  const {
    flaggedList,
    flaggedListLoading,
    detailByTimesheetId,
    detailLoadingTimesheetId,
  } = useAppSelector((s) => s.ruleViolation);

  const [violationsModalId, setViolationsModalId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTimesheetsThunk());
    dispatch(fetchEmailsThunk());
    dispatch(fetchAssignmentsThunk());
    dispatch(fetchFlaggedTimesheetsThunk());
  }, [dispatch]);

  /* ── Computed stats ──────────────────────────── */
  const activeClients = clients.filter((c) => c.is_active).length;
  const totalTimesheets = timesheets.length;
  const pendingApproval = timesheets.filter((t) => t.status === 'READY_FOR_APPROVAL').length;
  const approvedTimesheets = timesheets.filter((t) => t.status === 'APPROVED').length;
  const totalEmails = emails.length;
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((a) => a.is_active).length;

  /* ── Recent items (latest 5 each) ──────────── */
  const recentEmails = [...emails]
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

  const topFlagged = [...flaggedList]
    .sort((a, b) => {
      const da = a.latest_violation_created_at
        ? new Date(a.latest_violation_created_at).getTime()
        : 0;
      const db = b.latest_violation_created_at
        ? new Date(b.latest_violation_created_at).getTime()
        : 0;
      return db - da;
    })
    .slice(0, 5);
  const violationsDetail = violationsModalId
    ? detailByTimesheetId[violationsModalId]
    : null;

  const openViolations = (id: string) => {
    if (!detailByTimesheetId[id]) dispatch(fetchViolationDetailThunk(id));
    setViolationsModalId(id);
  };

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Operations dashboard</h3>
          <p className="page-header__subtitle">
            Live workload, email intake, and compliance signals for your clients.
          </p>
        </div>
      </div>

      {/* ── Stats cards ─────────────────────────── */}
      <div className="stats-grid">

        <StatsCard label="Active Clients" value={activeClients} />
        <StatsCard label="Total Emails" value={totalEmails} />
        <StatsCard label="Total Timesheets" value={totalTimesheets} />
        <StatsCard label="Pending Approval" value={pendingApproval} />
        <StatsCard label="Approved" value={approvedTimesheets} />
        <StatsCard label="Active Assignments" value={`${activeAssignments} / ${totalAssignments}`} />
        <StatsCard
          label="Rule violations (flagged)"
          value={flaggedList.length}
          hint="Timesheets with engine findings"
        />
      </div>

      {/* ── Rule violations (timesheet context) ─── */}
      <div className="table-wrap feature-surface" style={{ marginTop: '1.5rem' }}>
        <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong className="section-title-inline">Rule violations</strong>
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>
              Timesheets with rule engine violations — resolve before approval.
            </p>
          </div>
          <Button variant="secondary" className="btn--sm" onClick={() => navigate('/dashboard/rule-violations')}>
            Open full queue
          </Button>
        </div>
        {flaggedListLoading ? (
          <div className="no-data" style={{ padding: '1.5rem' }}>Loading…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Week ending</th>
                <th>Sender</th>
                <th>Status</th>
                <th>Timesheet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topFlagged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No flagged timesheets — pipeline is clean.
                  </td>
                </tr>
              ) : (
                topFlagged.map((row) => (
                  <tr key={row.timesheet_id}>
                    <td>{row.week_ending ? new Date(row.week_ending).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{row.email}</td>
                    <td><Badge variant="assignment_violation">{row.status}</Badge></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {row.timesheet_id.slice(0, 8)}…
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="btn--sm"
                        onClick={() => openViolations(row.timesheet_id)}
                      >
                        View violations
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!violationsModalId}
        onClose={() => setViolationsModalId(null)}
        title="Violations by severity"
        size="lg"
        actions={
          <Button variant="ghost" onClick={() => setViolationsModalId(null)}>Close</Button>
        }
      >
        {violationsModalId &&
          detailLoadingTimesheetId === violationsModalId &&
          !violationsDetail ? (
          <div className="no-data">Loading…</div>
        ) : violationsDetail ? (
          violationsDetail.violations.length === 0 ? (
            <div className="no-data">No violations in payload.</div>
          ) : (
            <ViolationSeverityList items={violationsDetail.violations} />
          )
        ) : (
          <div className="no-data">Loading detail…</div>
        )}
      </Modal>

      {/* ── Recent Activity Panels ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>

        {/* Recent Emails */}
        <div
          className="table-wrap"
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/dashboard/emails')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard/emails');
          }}
        >
          <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.85rem' }}>Recent Emails</strong>
            <Button variant="ghost" className="btn--sm" onClick={() => navigate('/dashboard/emails')}>View all →</Button>
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
                  <tr key={e.email_message_id} style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/emails')}>
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
        <div
          className="table-wrap"
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/dashboard/client-config')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard/client-config');
          }}
        >
          <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.85rem' }}>Recent Clients</strong>
            <Button variant="ghost" className="btn--sm" onClick={() => navigate('/dashboard/client-config')}>View all →</Button>
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
                  <tr key={c.client_id} style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/client-config')}>
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
