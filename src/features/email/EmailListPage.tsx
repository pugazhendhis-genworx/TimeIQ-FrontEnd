/* ──────────────────────────────────────────────
 *  Email list – Operation Executive
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchEmailsThunk,
  processAllEmailsThunk,
  reprocessFailedEmailsThunk,
} from './emailSlice';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';
import config from '../../config/apiConfig';

const EmailListPage = () => {
  const dispatch = useAppDispatch();
  const { emails, emailsLoading, processing, reprocessing } = useAppSelector((s) => s.email);
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEmailsThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = emails;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.sender_email.toLowerCase().includes(q),
      );
    }
    if (classificationFilter) {
      result = result.filter(
        (e) => (e.classification ?? '').toLowerCase() === classificationFilter,
      );
    }
    return result;
  }, [emails, search, classificationFilter]);

  const selected = emails.find((e) => e.email_message_id === selectedId) ?? null;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="page-header">
        <h3 className="page-header__title">Emails</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            className="btn--sm"
            onClick={() => dispatch(fetchEmailsThunk())}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            className="btn--sm"
            disabled={processing || reprocessing}
            onClick={async () => {
              if (processing || reprocessing) return;
              try {
                const res: any = await dispatch(processAllEmailsThunk()).unwrap();
                toast(
                  `Processed ${res.processed_count} emails, ${res.failed_count} failures`,
                );
                dispatch(fetchEmailsThunk());
              } catch {
                toast('Bulk processing failed', 'error');
              }
            }}
          >
            {processing ? 'Classifying…' : 'Classify & Process'}
          </Button>
          <Button
            variant="secondary"
            className="btn--sm"
            disabled={processing || reprocessing}
            onClick={async () => {
              if (processing || reprocessing) return;
              try {
                const res: any = await dispatch(reprocessFailedEmailsThunk()).unwrap();
                toast(`Reprocessed ${res.processed_count} emails`);
                dispatch(fetchEmailsThunk());
              } catch {
                toast('Retry failed', 'error');
              }
            }}
          >
            {reprocessing ? 'Retrying…' : 'Retry Failed'}
          </Button>
        </div>
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
          <select
            className="table-toolbar__select"
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="timesheet">Timesheet</option>
            <option value="non_timesheet">Non-timesheet</option>
          </select>
        </div>

        {(processing || reprocessing) && (
          <div
            style={{
              padding: '0.6rem 1rem',
              marginBottom: '0.75rem',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 'var(--radius)',
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
            }}
          >
            {processing
              ? '⏳ Classifying and processing emails — please wait, this may take a moment…'
              : '⏳ Retrying failed emails — please wait…'}
          </div>
        )}
        {emailsLoading ? (
          <div className="no-data" style={{ padding: '2rem' }}>
            Loading emails…
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Received At</th>
                <th>Sender</th>
                <th>Subject</th>
                <th>Classification</th>
                <th>Processed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No emails match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.email_message_id}>
                    <td>{new Date(e.received_at).toLocaleString()}</td>
                    <td>{e.sender_email}</td>
                    <td>{e.subject ?? '—'}</td>
                    <td>{e.classification ?? '—'}</td>
                    <td>{e.processed_status ?? '—'}</td>
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
          title="Email Details"
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
          <div className="detail-row">
            <span className="detail-label">Classification</span>
            <span>{selected.classification ?? '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Processed Status</span>
            <span>{selected.processed_status ?? '—'}</span>
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
                      href={`${config.SERVICES_API_BASE_URL}/attachments/${encodeURIComponent(
                        att.file_name,
                      )}`}
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

export default EmailListPage;

