/* ──────────────────────────────────────────────
 *  Timesheet Emails – filtered timesheet-only view
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTimesheetEmailsThunk } from './emailSlice';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const TimesheetEmailPage = () => {
  const dispatch = useAppDispatch();
  const { timesheetEmails, timesheetEmailsLoading } = useAppSelector(
    (s) => s.email,
  );
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTimesheetEmailsThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = timesheetEmails;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.sender_email.toLowerCase().includes(q),
      );
    }
    return result;
  }, [timesheetEmails, search]);

  const selected =
    timesheetEmails.find((e) => e.email_message_id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Timesheet Emails</h3>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input
            className="table-toolbar__input"
            type="text"
            placeholder="Search by subject or sender…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {timesheetEmailsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading timesheet emails…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Received At</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Classification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No timesheet emails match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.email_message_id}>
                    <td>{new Date(e.received_at).toLocaleString()}</td>
                    <td>{e.sender_email}</td>
                    <td>{e.subject ?? '—'}</td>
                    <td>{e.classification ?? '—'}</td>
                    <td>
                      <Button
                        variant="ghost"
                        className="btn--sm"
                        onClick={() => openDetail(e.email_message_id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title="Timesheet Email"
          actions={
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="detail-row">
            <span className="detail-label">Sender</span>
            <span>{selected.sender_email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Received At</span>
            <span>{new Date(selected.received_at).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Subject</span>
            <span>{selected.subject ?? '—'}</span>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <strong>Body Preview</strong>
            <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
              {selected.body ?? 'No body available'}
            </p>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <strong>Attachments</strong>
            {selected.attachments.length === 0 ? (
              <p style={{ marginTop: '0.25rem' }}>No attachments</p>
            ) : (
              <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                {selected.attachments.map((att) => (
                  <li key={att.attachment_id}>
                    <a
                      href={`/attachments/${encodeURIComponent(att.file_name)}`}
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
        </Modal>
      )}
    </>
  );
};

export default TimesheetEmailPage;

