/* ──────────────────────────────────────────────
 *  Auditor dashboard – reviews, violations, payroll-ready signal
 * ────────────────────────────────────────────── */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTimesheetsThunk } from '../timesheet/timesheetSlice';
import { fetchFlaggedTimesheetsThunk } from '../rule-violations/ruleViolationSlice';
import { fetchPendingReviewsThunk } from './auditSlice';
import { fetchExtractedTimesheetsApi } from '../extracted/services/extractedDataService';
import { fetchAllPayrollReadyApi } from '../payroll-ready/services/payrollReadyService';
import StatsCard from '../dashboard/components/StatsCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
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
  AreaChart,
  Area,
} from 'recharts';
import { useState } from 'react';

const AuditorDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { timesheets } = useAppSelector((s) => s.timesheet);
  const { flaggedList } = useAppSelector((s) => s.ruleViolation);
  const { pendingReviews } = useAppSelector((s) => s.audit);

  const [extractedCount, setExtractedCount] = useState(0);
  const [payrollLineCount, setPayrollLineCount] = useState(0);

  useEffect(() => {
    dispatch(fetchTimesheetsThunk());
    dispatch(fetchFlaggedTimesheetsThunk());
    dispatch(fetchPendingReviewsThunk());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ext, pay] = await Promise.all([
          fetchExtractedTimesheetsApi(),
          fetchAllPayrollReadyApi(),
        ]);
        if (!cancelled) {
          setExtractedCount(ext.length);
          setPayrollLineCount(pay.length);
        }
      } catch {
        if (!cancelled) {
          setExtractedCount(0);
          setPayrollLineCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = timesheets.filter((t) => t.status === 'READY_FOR_APPROVAL').length;
  const approvedCount = timesheets.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = timesheets.filter((t) => t.status === 'REJECTED').length;
  const inFlightCount = timesheets.filter((t) =>
    !['APPROVED', 'REJECTED', 'READY_FOR_APPROVAL'].includes(t.status),
  ).length;

  const pieData = [
    { name: 'Pending review', value: pendingCount, color: '#f59e0b' },
    { name: 'Approved', value: approvedCount, color: '#16a34a' },
    { name: 'Rejected', value: rejectedCount, color: '#dc2626' },
    { name: 'In pipeline', value: inFlightCount, color: '#2563eb' },
  ].filter((d) => d.value > 0);

  const openReviews = useMemo(
    () =>
      pendingReviews.filter(
        (r) => r.status !== 'APPROVED' && r.status !== 'REJECTED',
      ),
    [pendingReviews],
  );

  const barData = useMemo(
    () => [
      { name: 'Reviews queue', n: openReviews.length },
      { name: 'Violations', n: flaggedList.length },
      { name: 'Payroll lines', n: payrollLineCount },
      { name: 'Extracted TS', n: extractedCount },
    ],
    [openReviews.length, flaggedList.length, payrollLineCount, extractedCount],
  );

  const trendData = useMemo(() => {
    const buckets: Record<string, number> = {};
    timesheets.forEach((t) => {
      const d = t.updated_at ? new Date(t.updated_at).toISOString().slice(0, 10) : '';
      if (!d) return;
      buckets[d] = (buckets[d] ?? 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [timesheets]);

  const reviewPreview = [...openReviews].slice(0, 6);

  return (
    <div>
      <div className="page-header page-header--feature">
        <div>
          <h3 className="page-header__title">Auditor control center</h3>
          <p className="page-header__subtitle">
            Approvals, rule compliance, and payroll-ready output in one place.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard label="Open manual reviews" value={openReviews.length} />
        <StatsCard label="Flagged (rule violations)" value={flaggedList.length} />
        <StatsCard label="Timesheets (loaded)" value={timesheets.length} />
        <StatsCard label="Extracted timesheets" value={extractedCount} />
        <StatsCard label="Payroll-ready lines" value={payrollLineCount} />
      </div>

      <div className="dashboard-chart-grid">
        <div className="insight-card">
          <h4 className="insight-card__title">Timesheet outcomes</h4>
          {pieData.length === 0 ? (
            <div className="no-data" style={{ padding: '2rem' }}>No timesheet data</div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry) => (
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

        <div className="insight-card">
          <h4 className="insight-card__title">Work queues compared</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="n" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="insight-card">
          <div className="table-toolbar" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h4 className="insight-card__title" style={{ marginBottom: 0 }}>Needs review</h4>
            <Button variant="ghost" className="btn--sm" onClick={() => navigate('/dashboard/audit-timesheets')}>
              Open all
            </Button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timesheet</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reviewPreview.length === 0 ? (
                <tr><td colSpan={3} className="no-data">Queue is clear</td></tr>
              ) : (
                reviewPreview.map((r) => (
                  <tr key={r.review_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {r.timesheet_id.slice(0, 8)}…
                    </td>
                    <td><Badge variant="info">{r.status}</Badge></td>
                    <td>
                      <Button
                        variant="ghost"
                        className="btn--sm"
                        onClick={() =>
                          navigate(`/dashboard/extracted-timesheets/${r.timesheet_id}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="insight-card insight-card--span-2">
          <h4 className="insight-card__title">Recent timesheet activity (by day)</h4>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="audFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0052cc" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0052cc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0052cc"
                  fill="url(#audFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="quick-links-bar">
        <Button variant="secondary" className="btn--sm" onClick={() => navigate('/dashboard/payroll-ready')}>
          Payroll-ready export
        </Button>
        <Button variant="ghost" className="btn--sm" onClick={() => navigate('/dashboard/extracted-timesheets')}>
          Extracted data
        </Button>
        <Button variant="ghost" className="btn--sm" onClick={() => navigate('/dashboard/audit-logs')}>
          Audit logs
        </Button>
      </div>
    </div>
  );
};

export default AuditorDashboard;
