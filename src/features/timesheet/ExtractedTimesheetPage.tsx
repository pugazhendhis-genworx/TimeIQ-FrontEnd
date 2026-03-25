/* ──────────────────────────────────────────────
 *  Extracted Timesheet detail – Auditor/Executive
 *  Uses /extracted-data/{id} for enriched display
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchExtractedTimesheetThunk } from './timesheetSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';

const statusLabelMap: Record<string, string> = {
  RECEIVED: 'Received',
  EXTRACTED: 'Extracted',
  MATCHED: 'Matched',
  UNMATCHED: 'Unmatched',
  READY_FOR_APPROVAL: 'Ready for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

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

const ExtractedTimesheetPage = () => {
  const { timesheetId } = useParams<{ timesheetId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { extractedById, extractedLoading } = useAppSelector((s) => s.timesheet);

  const fromRuleViolations = searchParams.get('from') === 'rule-violations';
  const ruleViolationsBackUrl = timesheetId
    ? `/dashboard/rule-violations?timesheetId=${encodeURIComponent(timesheetId)}`
    : '/dashboard/rule-violations';

  useEffect(() => {
    if (timesheetId) {
      dispatch(fetchExtractedTimesheetThunk(timesheetId));
    }
  }, [dispatch, timesheetId]);

  const detail = timesheetId ? extractedById[timesheetId] ?? null : null;

  const [entryPage, setEntryPage] = useState(1);
  const pageSize = 10;
  const totalItems = detail?.entries.length ?? 0;

  useEffect(() => {
    setEntryPage(1);
  }, [timesheetId, totalItems]);

  const paginatedEntries = useMemo(() => {
    if (!detail) return [];
    return detail.entries.slice(
      (entryPage - 1) * pageSize,
      entryPage * pageSize,
    );
  }, [detail, entryPage]);

  if (extractedLoading) {
    return (
      <div className="page-header">
        <div className="no-data" style={{ padding: '3rem' }}>Loading timesheet data…</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <div className="page-header">
          <h3 className="page-header__title">Extracted Timesheet Data</h3>
        </div>
        <div className="no-data" style={{ padding: '3rem' }}>
          No extracted data found for this timesheet.
        </div>
      </div>
    );
  }

  const matchedCount = detail.entries.filter((e) => e.matching_status === 'MATCHED').length;
  const unmatchedCount = detail.entries.length - matchedCount;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {fromRuleViolations && (
            <Button
              variant="ghost"
              className="btn--sm"
              onClick={() => navigate(ruleViolationsBackUrl)}
            >
              Back
            </Button>
          )}
          <h3 className="page-header__title">Extracted Timesheet</h3>
        </div>
      </div>

      <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
        {/* ── Timesheet meta ── */}
        <div className="ts-meta" style={{ marginBottom: '1.5rem' }}>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Client</span>
            <span className="ts-meta__value">{detail.client_name}</span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Week Ending</span>
            <span className="ts-meta__value">{fmtDate(detail.week_ending)}</span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Sender Email</span>
            <span className="ts-meta__value">{detail.sender_email}</span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Received At</span>
            <span className="ts-meta__value">{fmt(detail.received_at)}</span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Status</span>
            <span className="ts-meta__value">
              <Badge
                variant={
                  detail.status === 'APPROVED' ? 'active'
                    : detail.status === 'REJECTED' ? 'inactive'
                      : 'info'
                }
              >
                {statusLabelMap[detail.status] ?? detail.status}
              </Badge>
            </span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Extraction Confidence</span>
            <span className="ts-meta__value">
              {detail.extraction_confidence != null
                ? `${(detail.extraction_confidence * 100).toFixed(0)}%`
                : '—'}
            </span>
          </div>
          <div className="ts-meta__item">
            <span className="ts-meta__label">Matched Entries</span>
            <span className="ts-meta__value" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
              {matchedCount} / {detail.entries.length}
            </span>
          </div>
          {unmatchedCount > 0 && (
            <div className="ts-meta__item">
              <span className="ts-meta__label">Unmatched / Violations</span>
              <span className="ts-meta__value" style={{ color: 'var(--color-error)', fontWeight: 700 }}>
                {unmatchedCount}
              </span>
            </div>
          )}
        </div>

        {/* ── Entries table ── */}
        {detail.entries.length === 0 ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            No time entries found for this timesheet.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Paycode</th>
                    <th>Start</th>
                    <th>End</th>
                    <th style={{ textAlign: 'right' }}>Regular (h)</th>
                    <th style={{ textAlign: 'right' }}>Overtime (h)</th>
                    <th style={{ textAlign: 'right' }}>Double Time (h)</th>
                    <th>Match Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((entry, idx) => {
                    const meta = matchingMeta[entry.matching_status] ??
                      { label: entry.matching_status, variant: 'info' };
                    const reason =
                      entry.employee_unmatched_reason ??
                      entry.client_unmatched_reason ?? null;

                    return (
                      <tr key={entry.timeentry_id}>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          {(entryPage - 1) * pageSize + idx + 1}
                        </td>
                        <td>
                          {entry.employee_name ?? (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Unknown</span>
                          )}
                        </td>
                        <td>
                          {entry.paycode_code
                            ? <span className="client-code-cell">{entry.paycode_code}</span>
                            : '—'}
                        </td>
                        <td>{fmt(entry.start_time)}</td>
                        <td>{fmt(entry.end_time)}</td>
                        <td style={{ textAlign: 'right' }}>{Number(entry.regular_hours).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{Number(entry.overtime_hours).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{Number(entry.double_time_hours).toFixed(2)}</td>
                        <td>
                          <div>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                            {entry.match_confidence != null && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '0.4rem' }}>
                                {(entry.match_confidence * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          {reason && (
                            <div className="entry-reason">{reason}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={entryPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setEntryPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ExtractedTimesheetPage;


