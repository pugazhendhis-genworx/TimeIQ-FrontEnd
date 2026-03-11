/* ──────────────────────────────────────────────
 *  Timesheet list – Operation Executive
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchTimesheetsThunk,
  fetchTimesheetsByStatusThunk,
  fetchTimesheetsByClientThunk,
  submitForApprovalThunk,
  fetchTimesheetEntriesThunk,
  fetchExtractedTimesheetThunk,
  updateTimesheetThunk,
} from './timesheetSlice';
import { fetchEmployeesThunk } from '../employee/employeeSlice';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

const statusLabelMap: Record<string, string> = {
  RECEIVED: 'Received',
  EXTRACTED: 'Extracted',
  MATCHED: 'Matched',
  UNMATCHED: 'Unmatched',
  READY_FOR_APPROVAL: 'Ready for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/** Human-readable label + badge variant for per-entry matching_status */
const matchingMeta: Record<string, { label: string; variant: string }> = {
  MATCHED: { label: 'Matched', variant: 'matched' },
  EMPLOYEE_UNMATCHED: { label: 'Employee unmatched', variant: 'employee_unmatched' },
  CLIENT_UNMATCHED: { label: 'Client unmatched', variant: 'client_unmatched' },
  ASSIGNMENT_VIOLATION: { label: 'Assignment violation', variant: 'assignment_violation' },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : '—';

const TimesheetListPage = () => {
  const dispatch = useAppDispatch();
  const {
    timesheets,
    timesheetsLoading,
    selectedTimesheetId,
    entriesByTimesheetId,
    extractedById,
    extractedLoading,
  } = useAppSelector((s) => s.timesheet);
  const { clients } = useAppSelector((s) => s.client);
  const { employees } = useAppSelector((s) => s.employee);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchTimesheetsThunk());
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  /* Pre-load raw entries for employee-name search */
  useEffect(() => {
    timesheets.forEach((t) => {
      if (!entriesByTimesheetId[t.timesheet_id]) {
        dispatch(fetchTimesheetEntriesThunk(t.timesheet_id));
      }
    });
  }, [dispatch, timesheets, entriesByTimesheetId]);

  const filtered = useMemo(() => {
    let result = timesheets;
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (clientFilter) result = result.filter((t) => t.client_id === clientFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const clientName =
          clients.find((c) => c.client_id === t.client_id)?.client_name ?? '';
        const entries = entriesByTimesheetId[t.timesheet_id] || [];
        const employeeMatch = entries.some((ent) => {
          const emp = employees.find((e) => e.employee_id === ent.employee_id);
          if (!emp) return false;
          return `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q);
        });
        return clientName.toLowerCase().includes(q) || employeeMatch;
      });
    }
    return result;
  }, [timesheets, statusFilter, clientFilter, search, clients, employees, entriesByTimesheetId]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) dispatch(fetchTimesheetsByStatusThunk(value));
    else dispatch(fetchTimesheetsThunk());
  };

  const handleClientFilterChange = (value: string) => {
    setClientFilter(value);
    if (value) dispatch(fetchTimesheetsByClientThunk(value));
    else dispatch(fetchTimesheetsThunk());
  };

  const handleOpenDetails = (id: string) => {
    dispatch(fetchExtractedTimesheetThunk(id));
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
  };

  const handleSubmitForApproval = (id: string) => {
    dispatch(submitForApprovalThunk(id));
  };

  const handleEdit = (id: string, currentStatus: string) => {
    setEditingId(id);
    setDraftStatus((prev) => ({ ...prev, [id]: currentStatus }));
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSaveEdit = (id: string) => {
    const status = draftStatus[id];
    if (!status) { setEditingId(null); return; }
    dispatch(updateTimesheetThunk({ timesheetId: id, payload: { status } }));
    setEditingId(null);
  };

  /* Current extracted timesheet for the open detail modal */
  const extractedDetail =
    selectedTimesheetId ? extractedById[selectedTimesheetId] ?? null : null;

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Timesheets</h3>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search by client or employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.keys(statusLabelMap).map((s) => (
              <option key={s} value={s}>{statusLabelMap[s]}</option>
            ))}
          </select>
          <select
            className="table-toolbar__select"
            value={clientFilter}
            onChange={(e) => handleClientFilterChange(e.target.value)}
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
            ))}
          </select>
        </div>

        {timesheetsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>Loading timesheets…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timesheet ID</th>
                <th>Client</th>
                <th>Status</th>
                <th>Source</th>
                <th>Week Ending</th>
                <th>Extraction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">No timesheets match your filters</td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const clientName =
                    clients.find((c) => c.client_id === t.client_id)?.client_name ?? '—';
                  const statusVariant =
                    t.status === 'APPROVED' ? 'active'
                      : t.status === 'REJECTED' ? 'inactive'
                        : 'info';

                  return (
                    <tr key={t.timesheet_id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {t.timesheet_id.slice(0, 8)}…
                      </td>
                      <td>{clientName}</td>
                      <td>
                        {editingId === t.timesheet_id ? (
                          <select
                            className="table-toolbar__select"
                            value={draftStatus[t.timesheet_id] ?? t.status}
                            onChange={(e) =>
                              setDraftStatus((prev) => ({ ...prev, [t.timesheet_id]: e.target.value }))
                            }
                          >
                            {Object.keys(statusLabelMap).map((s) => (
                              <option key={s} value={s}>{statusLabelMap[s]}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant={statusVariant}>
                            {statusLabelMap[t.status] ?? t.status}
                          </Badge>
                        )}
                      </td>
                      <td>{t.source ?? '—'}</td>
                      <td>{fmtDate(t.week_ending)}</td>
                      <td>{t.extraction_status ?? '—'}</td>
                      <td>
                        <Button
                          variant="ghost"
                          className="btn--sm"
                          onClick={() => handleOpenDetails(t.timesheet_id)}
                        >
                          View details
                        </Button>
                        {editingId === t.timesheet_id ? (
                          <>
                            <Button variant="secondary" className="btn--sm" onClick={() => handleSaveEdit(t.timesheet_id)}>Save</Button>
                            <Button variant="ghost" className="btn--sm" onClick={handleCancelEdit}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              className="btn--sm"
                              onClick={() => handleEdit(t.timesheet_id, t.status)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              className="btn--sm"
                              onClick={() => handleSubmitForApproval(t.timesheet_id)}
                              disabled={t.status === 'READY_FOR_APPROVAL'}
                            >
                              Move to approval
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail modal ────────────────────────────── */}
      <Modal
        open={detailOpen}
        onClose={handleCloseDetails}
        title="Timesheet Details"
        size="xl"
        actions={
          <Button variant="ghost" onClick={handleCloseDetails}>Close</Button>
        }
      >
        {extractedLoading ? (
          <div className="no-data">Loading entries…</div>
        ) : !extractedDetail ? (
          <div className="no-data">
            No extracted data found for this timesheet.<br />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              The timesheet may not have been processed yet.
            </span>
          </div>
        ) : (
          <>
            {/* Timesheet header meta */}
            <div className="ts-meta">
              <div className="ts-meta__item">
                <span className="ts-meta__label">Client</span>
                <span className="ts-meta__value">{extractedDetail.client_name}</span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Week Ending</span>
                <span className="ts-meta__value">{fmtDate(extractedDetail.week_ending)}</span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Sender Email</span>
                <span className="ts-meta__value">{extractedDetail.sender_email}</span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Received At</span>
                <span className="ts-meta__value">{fmt(extractedDetail.received_at)}</span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Status</span>
                <span className="ts-meta__value">
                  <Badge
                    variant={
                      extractedDetail.status === 'APPROVED' ? 'active'
                        : extractedDetail.status === 'REJECTED' ? 'inactive'
                          : 'info'
                    }
                  >
                    {statusLabelMap[extractedDetail.status] ?? extractedDetail.status}
                  </Badge>
                </span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Extraction Confidence</span>
                <span className="ts-meta__value">
                  {extractedDetail.extraction_confidence != null
                    ? `${(extractedDetail.extraction_confidence * 100).toFixed(0)}%`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Entries table */}
            {extractedDetail.entries.length === 0 ? (
              <div className="no-data" style={{ padding: '1rem 0' }}>
                No time entries in this timesheet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Paycode</th>
                      <th>Start</th>
                      <th>End</th>
                      <th style={{ textAlign: 'right' }}>Reg h</th>
                      <th style={{ textAlign: 'right' }}>OT h</th>
                      <th style={{ textAlign: 'right' }}>DT h</th>
                      <th>Match Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedDetail.entries.map((entry) => {
                      const meta = matchingMeta[entry.matching_status] ??
                        { label: entry.matching_status, variant: 'info' };
                      const reason =
                        entry.employee_unmatched_reason ??
                        entry.client_unmatched_reason ?? null;

                      return (
                        <tr key={entry.timeentry_id}>
                          <td>
                            {entry.employee_name ?? (
                              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                Unknown
                              </span>
                            )}
                          </td>
                          <td>
                            {entry.paycode_code ? (
                              <span className="client-code-cell">{entry.paycode_code}</span>
                            ) : '—'}
                          </td>
                          <td>{fmt(entry.start_time)}</td>
                          <td>{fmt(entry.end_time)}</td>
                          <td style={{ textAlign: 'right' }}>{Number(entry.regular_hours).toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{Number(entry.overtime_hours).toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>{Number(entry.double_time_hours).toFixed(2)}</td>
                          <td>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                            {reason && (
                              <div className="entry-reason" title={reason}>
                                {reason.length > 60 ? reason.slice(0, 60) + '…' : reason}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default TimesheetListPage;

