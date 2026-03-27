/* ──────────────────────────────────────────────
 *  Payroll-ready export lines – auditor
 * ────────────────────────────────────────────── */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fmtStored as fmtTs, fmtStoredDate as fmtDate } from '../../utils/formatStoredTime';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchClientsThunk } from '../client/clientSlice';
import {
  fetchAllPayrollReadyApi,
  fetchPayrollSummaryByTimesheetApi,
} from './services/payrollReadyService';
import { fetchExtractedTimesheetByIdApi } from '../timesheet/services/timesheetService';
import type { PayrollReadyEntry, PayrollTimesheetSummary } from './types/payrollReady.types';
import type { ExtractedTimesheetDisplay } from '../timesheet/types/timesheet.types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

/* fmtDate is imported from formatStoredTime */

const statusLabelMap: Record<string, string> = {
  RECEIVED: 'Received',
  EXTRACTED: 'Extracted',
  MATCHED: 'Matched',
  UNMATCHED: 'Unmatched',
  READY_FOR_APPROVAL: 'Ready for approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/* fmtTs is imported from formatStoredTime */

const PayrollReadyPage = () => {
  const dispatch = useAppDispatch();
  const { clients } = useAppSelector((s) => s.client);

  const [entries, setEntries] = useState<PayrollReadyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'week' | 'entries'>('week');
  const [page, setPage] = useState(1);

  const [viewId, setViewId] = useState<string | null>(null);
  const [summary, setSummary] = useState<PayrollTimesheetSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [enrichedOpen, setEnrichedOpen] = useState(false);
  const [enrichedData, setEnrichedData] = useState<ExtractedTimesheetDisplay | null>(null);
  const [enrichedLoading, setEnrichedLoading] = useState(false);

  const closeEnriched = useCallback(() => {
    setEnrichedOpen(false);
    setEnrichedData(null);
  }, []);

  const openEnriched = async (timesheetId: string) => {
    setEnrichedOpen(true);
    setEnrichedData(null);
    setEnrichedLoading(true);
    try {
      const data = await fetchExtractedTimesheetByIdApi(timesheetId);
      setEnrichedData(data);
    } catch {
      setEnrichedData(null);
    } finally {
      setEnrichedLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPayrollReadyApi();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchClientsThunk());
    void load();
  }, [dispatch]);

  const grouped = useMemo(() => {
    const m = new Map<string, PayrollReadyEntry[]>();
    entries.forEach((e) => {
      if (!m.has(e.timesheet_id)) m.set(e.timesheet_id, []);
      m.get(e.timesheet_id)!.push(e);
    });
    return [...m.entries()].map(([timesheet_id, list]) => {
      const week = list[0]?.week_ending ?? null;
      const clientId = list[0]?.client_id ?? '';
      const totalReg = list.reduce((s, x) => s + x.regular_hours, 0);
      return { timesheet_id, list, week, clientId, totalReg };
    });
  }, [entries]);

  const filtered = useMemo(() => {
    let rows = grouped;
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.timesheet_id.toLowerCase().includes(q) ||
          r.clientId.toLowerCase().includes(q),
      );
    }
    rows = [...rows].sort((a, b) => {
      if (sortKey === 'entries') return b.list.length - a.list.length;
      const da = a.week ? new Date(a.week).getTime() : 0;
      const db = b.week ? new Date(b.week).getTime() : 0;
      return db - da;
    });
    return rows;
  }, [grouped, search, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey]);

  const pageSize = 10;
  const totalItems = filtered.length;
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openView = async (timesheetId: string) => {
    setViewId(timesheetId);
    setSummary(null);
    setSummaryLoading(true);
    try {
      const s = await fetchPayrollSummaryByTimesheetApi(timesheetId);
      setSummary(s);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const clientName = (id: string) =>
    clients.find((c) => c.client_id === id)?.client_name ?? id.slice(0, 8);

  return (
    <>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Payroll-ready timesheets</h3>
          <p className="page-header__subtitle">
            Approved payroll lines grouped by timesheet. View all calculated rows for export.
          </p>
        </div>
        <Button variant="ghost" className="btn--sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      <div className="table-wrap feature-surface">
        <div className="table-toolbar table-toolbar--wrap">
          <input
            className="table-toolbar__input"
            placeholder="Search timesheet or client id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="table-toolbar__select"
            value={sortKey}
            onChange={(e) =>
              setSortKey(e.target.value as 'week' | 'entries')
            }
          >
            <option value="week">Sort by week ending</option>
            <option value="entries">Sort by line count</option>
          </select>
        </div>

        {loading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading payroll-ready data…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Week ending</th>
                <th>Client</th>
                <th>Lines</th>
                <th>Total reg. hours</th>
                <th>Timesheet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No payroll-ready entries yet.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.timesheet_id}>
                    <td>{fmtDate(row.week)}</td>
                    <td>{clientName(row.clientId)}</td>
                    <td>{row.list.length}</td>
                    <td style={{ textAlign: 'right' }}>
                      {row.totalReg.toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {row.timesheet_id.slice(0, 8)}…
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        className="btn--sm"
                        onClick={() => openView(row.timesheet_id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        className="btn--sm"
                        onClick={() => openEnriched(row.timesheet_id)}
                      >
                        Enriched timesheet
                      </Button>
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
        open={!!viewId}
        onClose={() => {
          setViewId(null);
          setSummary(null);
        }}
        title="Payroll lines for timesheet"
        size="xl"
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              setViewId(null);
              setSummary(null);
            }}
          >
            Close
          </Button>
        }
      >
        {summaryLoading ? (
          <div className="no-data">Loading…</div>
        ) : summary ? (
          <>
            {summary.violations.length > 0 && (
              <div className="insight-card insight-card--warn" style={{ marginBottom: '1rem' }}>
                <strong>Recorded violations on file</strong>
                <p className="text-sm text-muted">
                  {summary.violations.length} row(s) — review before export.
                </p>
              </div>
            )}
            {summary.payroll_entries[0]?.week_ending && (
              <div className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
                Week ending: {fmtDate(summary.payroll_entries[0].week_ending)}
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reg h</th>
                    <th>OT h</th>
                    <th>DT h</th>
                    <th>Reg rate</th>
                    <th>OT rate</th>
                    <th>DT rate</th>
                    <th>Reg pay</th>
                    <th>OT pay</th>
                    <th>Holiday pay</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.payroll_entries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="no-data">
                        No payroll lines for this timesheet.
                      </td>
                    </tr>
                  ) : (
                    summary.payroll_entries.map((e) => (
                      <tr key={e.payroll_entry_id}>
                        <td style={{ textAlign: 'right' }}>
                          {e.regular_hours.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {e.overtime_hours.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {e.double_time_hours.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{e.regular_rate}</td>
                        <td style={{ textAlign: 'right' }}>{e.overtime_rate}</td>
                        <td style={{ textAlign: 'right' }}>{e.double_time_rate}</td>
                        <td style={{ textAlign: 'right' }}>{e.reg_pay}</td>
                        <td style={{ textAlign: 'right' }}>{e.ot_pay}</td>
                        <td style={{ textAlign: 'right' }}>{e.holiday_pay}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="no-data">Could not load summary.</div>
        )}
      </Modal>

      <Modal
        open={enrichedOpen}
        onClose={closeEnriched}
        size="xxl"
        leading={
          <button type="button" className="modal__back" onClick={closeEnriched}>
            Back
          </button>
        }
        title="Enriched timesheet"
        actions={
          <Button variant="ghost" onClick={closeEnriched}>
            Close
          </Button>
        }
      >
        {enrichedLoading ? (
          <div className="no-data">Loading…</div>
        ) : enrichedData ? (
          <div style={{ maxHeight: 'min(78vh, 720px)', overflow: 'auto' }}>
            <div className="ts-meta" style={{ marginBottom: '1rem' }}>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Client</span>
                <span className="ts-meta__value">{enrichedData.client_name}</span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Week ending</span>
                <span className="ts-meta__value">
                  {enrichedData.week_ending
                    ? fmtDate(enrichedData.week_ending)
                    : '—'}
                </span>
              </div>
              <div className="ts-meta__item">
                <span className="ts-meta__label">Status</span>
                <span className="ts-meta__value">
                  <Badge
                    variant={
                      enrichedData.status === 'APPROVED'
                        ? 'active'
                        : enrichedData.status === 'REJECTED'
                          ? 'inactive'
                          : 'info'
                    }
                  >
                    {statusLabelMap[enrichedData.status] ?? enrichedData.status}
                  </Badge>
                </span>
              </div>
            </div>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reg</th>
                  <th>OT</th>
                  <th>DT</th>
                  <th>Code</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {enrichedData.entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">
                      No entries
                    </td>
                  </tr>
                ) : (
                  enrichedData.entries.map((entry) => (
                    <tr key={entry.timeentry_id}>
                      <td>{entry.employee_name ?? '—'}</td>
                      <td>{fmtTs(entry.start_time)}</td>
                      <td>{fmtTs(entry.end_time)}</td>
                      <td>{Number(entry.regular_hours).toFixed(2)}</td>
                      <td>{Number(entry.overtime_hours).toFixed(2)}</td>
                      <td>{Number(entry.double_time_hours).toFixed(2)}</td>
                      <td>{entry.paycode_code ?? '—'}</td>
                      <td>
                        <Badge variant="info">{entry.matching_status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">Could not load enriched timesheet.</div>
        )}
      </Modal>
    </>
  );
};

export default PayrollReadyPage;
