/* ──────────────────────────────────────────────
 *  Auditor Timesheet Review list
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPendingReviewsThunk } from './auditSlice';
import { approveTimesheetApi, rejectTimesheetApi } from '../extracted/services/extractedDataService';
import Button from '../../components/common/Button';
import { toast } from '../../utils/toast';
import Pagination from '../../components/common/Pagination';

const AuditorTimesheetPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pendingReviews, loading } = useAppSelector((s) => s.audit);
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const totalItems = pendingReviews.length;
  const paginated = useMemo(
    () =>
      pendingReviews.slice(
        (page - 1) * pageSize,
        page * pageSize,
      ),
    [pendingReviews, page],
  );

  useEffect(() => {
    dispatch(fetchPendingReviewsThunk());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [pendingReviews.length]);

  const handleDecision = async (timesheetId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      if (decision === 'APPROVED') {
        await approveTimesheetApi(timesheetId);
      } else {
        await rejectTimesheetApi(timesheetId);
      }
      toast(`Timesheet ${decision.toLowerCase()} successfully`);
      dispatch(fetchPendingReviewsThunk());
    } catch {
      toast(`Failed to ${decision.toLowerCase()} timesheet`, 'error');
    }
  };

  const openExtracted = (timesheetId: string) => {
    navigate(`/dashboard/extracted-timesheets/${timesheetId}`);
  };

  return (
    <div>
      <div className="page-header">
        <h3 className="page-header__title">Timesheets Review</h3>
      </div>
      <div className="table-wrap">
        {loading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading reviews…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Timesheet ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-data">
                    No timesheets pending review
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.review_id}>
                    <td>{r.review_id}</td>
                    <td>{r.timesheet_id}</td>
                    <td>{r.status}</td>
                    <td>
                      <Button
                        variant="ghost"
                        className="btn--sm"
                        onClick={() => openExtracted(r.timesheet_id)}
                      >
                        View extracted data
                      </Button>
                      <Button
                        variant="primary"
                        className="btn--sm"
                        disabled={r.status === 'APPROVED' || r.status === 'REJECTED'}
                        onClick={() => handleDecision(r.timesheet_id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        className="btn--sm"
                        disabled={r.status === 'APPROVED' || r.status === 'REJECTED'}
                        onClick={() => handleDecision(r.timesheet_id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <Pagination
          page={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AuditorTimesheetPage;

