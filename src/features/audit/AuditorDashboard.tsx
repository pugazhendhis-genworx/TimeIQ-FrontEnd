/* ──────────────────────────────────────────────
 *  Auditor Dashboard – overview
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchPendingReviewsThunk,
  fetchApprovalsThunk,
} from './auditSlice';
import StatsCard from '../../components/dashboard/StatsCard';

const AuditorDashboard = () => {
  const dispatch = useAppDispatch();
  const { pendingReviews, approvals } = useAppSelector((s) => s.audit);

  useEffect(() => {
    dispatch(fetchPendingReviewsThunk());
    dispatch(fetchApprovalsThunk());
  }, [dispatch]);

  const pendingCount = pendingReviews.length;
  const approvedCount = approvals.filter((a) => a.decision === 'APPROVED').length;
  const rejectedCount = approvals.filter((a) => a.decision === 'REJECTED').length;

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
    </div>
  );
};

export default AuditorDashboard;

