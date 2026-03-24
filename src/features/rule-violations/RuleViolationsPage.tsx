/* ──────────────────────────────────────────────
 *  Rule violations – operation executive & auditor
 *  Flagged timesheets, violation detail, source mail
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchFlaggedTimesheetsThunk,
  fetchViolationDetailThunk,
} from './ruleViolationSlice';
import { fetchEmailsThunk } from '../email/emailSlice';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import config from '../../config/apiConfig';
import ViolationSeverityList from './components/ViolationSeverityList';
import Pagination from '../../components/common/Pagination';

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : '—';

const RuleViolationsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((s) => s.auth);
  const role = user?.role?.toLowerCase() ?? '';
  const isAuditor = role === 'auditor';

  const {
    flaggedList,
    flaggedListLoading,
    detailByTimesheetId,
    detailLoadingTimesheetId,
  } = useAppSelector((s) => s.ruleViolation);
  const { emails } = useAppSelector((s) => s.email);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'week' | 'email' | 'email_received'>('email_received');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [violationsModalId, setViolationsModalId] = useState<string | null>(null);
  const [sourceSheetModalId, setSourceSheetModalId] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [pendingMailTimesheetId, setPendingMailTimesheetId] = useState<string | null>(
    null,
  );

  const timesheetIdQuery = searchParams.get('timesheetId');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFlaggedTimesheetsThunk());
    dispatch(fetchEmailsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!timesheetIdQuery) return;
    setViolationsModalId(timesheetIdQuery);
    if (!detailByTimesheetId[timesheetIdQuery]) {
      dispatch(fetchViolationDetailThunk(timesheetIdQuery));
    }
  }, [timesheetIdQuery, detailByTimesheetId, dispatch]);

  const closeViolationsModal = () => {
    setViolationsModalId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('timesheetId');
      return next;
    });
  };

  useEffect(() => {
    if (!pendingMailTimesheetId) return;
    const d = detailByTimesheetId[pendingMailTimesheetId];
    const em = d?.timesheet?.email_message_id;
    if (em && detailLoadingTimesheetId !== pendingMailTimesheetId) {
      setSelectedEmailId(em);
      setEmailModalOpen(true);
      setPendingMailTimesheetId(null);
    }
  }, [
    pendingMailTimesheetId,
    detailByTimesheetId,
    detailLoadingTimesheetId,
  ]);

  const openSourceMailForRow = (timesheetId: string) => {
    const existing = detailByTimesheetId[timesheetId]?.timesheet?.email_message_id;
    if (existing) {
      setSelectedEmailId(existing);
      setEmailModalOpen(true);
      return;
    }
    dispatch(fetchViolationDetailThunk(timesheetId));
    setPendingMailTimesheetId(timesheetId);
  };

  const ensureDetail = (timesheetId: string) => {
    if (!detailByTimesheetId[timesheetId]) {
      dispatch(fetchViolationDetailThunk(timesheetId));
    }
  };

  const openViolations = (id: string) => {
    ensureDetail(id);
    setViolationsModalId(id);
  };

  const openSourceSheet = (id: string) => {
    ensureDetail(id);
    setSourceSheetModalId(id);
  };

  const filteredSorted = useMemo(() => {
    let rows = flaggedList;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.email.toLowerCase().includes(q) ||
          r.timesheet_id.toLowerCase().includes(q) ||
          (r.source && r.source.toLowerCase().includes(q)),
      );
    }
    const mul = sortDir === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => {
      if (sortKey === 'email') {
        return mul * a.email.localeCompare(b.email);
      }
      if (sortKey === 'email_received') {
        const da = a.email_received_at
          ? new Date(a.email_received_at).getTime()
          : 0;
        const db = b.email_received_at
          ? new Date(b.email_received_at).getTime()
          : 0;
        return mul * (da - db);
      }

      const da = a.week_ending ? new Date(a.week_ending).getTime() : 0;
      const db = b.week_ending ? new Date(b.week_ending).getTime() : 0;
      return mul * (da - db);
    });
  }, [flaggedList, search, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, flaggedList.length]);

  const pageSize = 10;
  const totalItems = filteredSorted.length;
  const paginatedRows = filteredSorted.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const violationsDetail = violationsModalId
    ? detailByTimesheetId[violationsModalId]
    : null;
  const sourceDetail = sourceSheetModalId
    ? detailByTimesheetId[sourceSheetModalId]
    : null;
  const selectedEmail =
    emails.find((e) => e.email_message_id === selectedEmailId) ?? null;

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Rule violations</h3>
          <p className="page-header__subtitle">
            Timesheets flagged by the rule engine. Resolve issues before moving to approval.
          </p>
        </div>
        <Button
          variant="ghost"
          className="btn--sm"
          onClick={() => dispatch(fetchFlaggedTimesheetsThunk())}
        >
          Refresh
        </Button>
      </div>

      <div className="table-wrap feature-surface">
        <div className="table-toolbar table-toolbar--wrap">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search email, source, or timesheet id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={sortKey}
            onChange={(e) =>
              setSortKey(e.target.value as 'week' | 'email' | 'email_received')
            }
          >
            <option value="email_received">Sort: email received time</option>
            <option value="week">Sort: week ending</option>
            <option value="email">Sort: sender email</option>
          </select>
          <Button
            variant="ghost"
            className="btn--sm"
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          >
            {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>

        {flaggedListLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading flagged timesheets…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Week ending</th>
                <th>Sender</th>
                <th>Status</th>
                <th>Source</th>
                <th>Timesheet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    {flaggedList.length === 0
                      ? 'No rule violations on record — all clear.'
                      : 'No rows match your filters.'}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.timesheet_id}>
                    <td>{fmtDate(row.week_ending)}</td>
                    <td style={{ fontSize: '0.85rem' }}>{row.email}</td>
                    <td>
                      <Badge variant="assignment_violation">{row.status}</Badge>
                    </td>
                    <td>{row.source ?? '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {row.timesheet_id.slice(0, 8)}…
                    </td>
                    <td>
                      <div className="action-row">
                        <Button
                          variant="ghost"
                          className="btn--sm"
                          onClick={() => openViolations(row.timesheet_id)}
                        >
                          View violations
                        </Button>
                        <Button
                          variant="ghost"
                          className="btn--sm"
                          onClick={() => openSourceSheet(row.timesheet_id)}
                        >
                          Source timesheet
                        </Button>
                        <Button
                          variant="secondary"
                          className="btn--sm"
                          onClick={() => openSourceMailForRow(row.timesheet_id)}
                        >
                          View source mail
                        </Button>
                        {isAuditor && (
                          <Button
                            variant="ghost"
                            className="btn--sm"
                            onClick={() =>
                              navigate(
                                `/dashboard/extracted-timesheets/${row.timesheet_id}?from=rule-violations`,
                              )
                            }
                          >
                            Enriched view
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={page}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <Modal
        open={!!violationsModalId}
        onClose={closeViolationsModal}
        title="Violations by severity"
        size="lg"
        actions={
          <Button variant="ghost" onClick={closeViolationsModal}>
            Close
          </Button>
        }
      >
        {violationsModalId &&
        detailLoadingTimesheetId === violationsModalId &&
        !violationsDetail ? (
          <div className="no-data">Loading…</div>
        ) : violationsDetail ? (
          <>
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
              Engine status:{' '}
              <Badge variant="info">{violationsDetail.status}</Badge>
            </p>
            {violationsDetail.violations.length === 0 ? (
              <div className="no-data">No violation rows (timesheet may be clean now).</div>
            ) : (
              <ViolationSeverityList items={violationsDetail.violations} />
            )}
          </>
        ) : (
          <div className="no-data">Open again to load detail.</div>
        )}
      </Modal>

      <Modal
        open={!!sourceSheetModalId}
        onClose={() => setSourceSheetModalId(null)}
        title="Source timesheet (raw entries)"
        size="xl"
        actions={
          <Button variant="ghost" onClick={() => setSourceSheetModalId(null)}>
            Close
          </Button>
        }
      >
        {sourceSheetModalId &&
        detailLoadingTimesheetId === sourceSheetModalId &&
        !sourceDetail ? (
          <div className="no-data">Loading…</div>
        ) : sourceDetail ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th style={{ textAlign: 'right' }}>Reg</th>
                  <th style={{ textAlign: 'right' }}>OT</th>
                  <th style={{ textAlign: 'right' }}>DT</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {sourceDetail.time_entries_raw.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No raw entries
                    </td>
                  </tr>
                ) : (
                  sourceDetail.time_entries_raw.map((e) => (
                    <tr key={e.timeentry_id}>
                      <td>{fmt(e.start_time)}</td>
                      <td>{fmt(e.end_time)}</td>
                      <td style={{ textAlign: 'right' }}>
                        {Number(e.regular_hours).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {Number(e.overtime_hours).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {Number(e.double_time_hours).toFixed(2)}
                      </td>
                      <td>
                        <Badge variant="info">
                          {e.matching_status ?? '—'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">Open again to load detail.</div>
        )}
      </Modal>

      <Modal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Source email"
        size="lg"
        actions={
          <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedEmail ? (
          <>
            <div className="detail-row">
              <span className="detail-label">Sender</span>
              <span>{selectedEmail.sender_email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subject</span>
              <span>{selectedEmail.subject ?? '—'}</span>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <strong>Body</strong>
              <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                {selectedEmail.body ?? '—'}
              </p>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <strong>Attachments</strong>
              {selectedEmail.attachments.length === 0 ? (
                <p style={{ marginTop: '0.25rem' }}>None</p>
              ) : (
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {selectedEmail.attachments.map((att) => (
                    <li key={att.attachment_id}>
                      <a
                        href={`${config.SERVICES_API_BASE_URL}/attachments/${encodeURIComponent(att.file_name)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {att.file_name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="no-data">
            {selectedEmailId
              ? 'Email not loaded. Return to the list and open from a loaded detail.'
              : 'No email selected.'}
          </div>
        )}
      </Modal>
    </>
  );
};

export default RuleViolationsPage;
