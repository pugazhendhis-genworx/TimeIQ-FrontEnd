/* ──────────────────────────────────────────────
 *  Auditor Dashboard – overview
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTimesheetsThunk } from '../timesheet/timesheetSlice';
import StatsCard from '../dashboard/components/StatsCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AuditorDashboard = () => {
  const dispatch = useAppDispatch();
  const { timesheets } = useAppSelector((s) => s.timesheet);

  useEffect(() => {
    dispatch(fetchTimesheetsThunk());
  }, [dispatch]);

  const pendingCount = timesheets.filter((t) => t.status === 'READY_FOR_APPROVAL').length;
  const approvedCount = timesheets.filter((t) => t.status === 'APPROVED').length;
  const rejectedCount = timesheets.filter((t) => t.status === 'REJECTED').length;

  const chartData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Approved', value: approvedCount, color: '#10b981' },
    { name: 'Rejected', value: rejectedCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="page-header">
        <h3 className="page-header__title">Auditor Overview</h3>
      </div>
      <div className="stats-grid">
        <StatsCard label="Pending Reviews" value={pendingCount} />
        <StatsCard label="Approved Timesheets" value={approvedCount} />
        <StatsCard label="Rejected Timesheets" value={rejectedCount} />
      </div>

      <div
        style={{
          marginTop: '2rem',
          background: 'var(--color-bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h4 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Timesheet Status Distribution</h4>
        
        {chartData.length === 0 ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            No timesheet data available
          </div>
        ) : (
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 'var(--radius)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)' 
                  }} 
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditorDashboard;

