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
import Pagination from '../../components/common/Pagination';
import { toast } from '../../utils/toast';
import config from '../../config/apiConfig';

const EmailListPage = () => {
  const dispatch = useAppDispatch();
  const { emails, emailsLoading, processing, reprocessing } = useAppSelector((s) => s.email);
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pollingProcess, setPollingProcess] = useState(false);

  const terminalEmailStatuses = new Set([
    'COMPLETED',
    'FAILED',
    'NEEDS_REVIEW',
    'IGNORED',
  ]);

  const isTimeoutError = (err: unknown) => {
    const e = err as { code?: string; message?: string } | null;
    const code = e?.code;
    const msg = String(e?.message ?? '').toLowerCase();
    return code === 'ECONNABORTED' || msg.includes('timeout');
  };

  const pollForIngestedEmails = async (ingestedIds: Set<string>) => {
    const pollIntervalMs = 4000;
    const maxWaitMs = 180000;
    const start = Date.now();
    let lastEmails = emails;

    while (Date.now() - start < maxWaitMs) {
      lastEmails = await dispatch(fetchEmailsThunk()).unwrap();

      const byId = new Map(
        lastEmails.map((e) => [e.email_message_id, e.processed_status]),
      );
      const done = Array.from(ingestedIds).every((id) =>
        terminalEmailStatuses.has(byId.get(id) ?? ''),
      );

      if (done) return { done: true, emails: lastEmails };

      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }

    return { done: false, emails: lastEmails };
  };

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
      if (classificationFilter === 'non_timesheet') {
        result = result.filter((e) => (e.classification ?? '').toLowerCase() === 'other');
      } else {
        result = result.filter(
          (e) => (e.classification ?? '').toLowerCase() === classificationFilter,
        );
      }
    }
    /* Sort by received_at based on sortOrder */
    return [...result].sort((a, b) => {
      const timeA = new Date(a.received_at).getTime();
      const timeB = new Date(b.received_at).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [emails, search, classificationFilter, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [search, classificationFilter, sortOrder]);

  const pageSize = 10;
  const totalItems = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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
              const ingestedIds = new Set(
                emails
                  .filter((e) => e.processed_status === 'INGESTED')
                  .map((e) => e.email_message_id),
              );

              if (ingestedIds.size === 0) {
                toast('No new emails to classify right now.');
                return;
              }

              toast('Classification started. This may take a moment for large batches…');
              try {
                const res: any = await dispatch(processAllEmailsThunk()).unwrap();
                if (res.failed_count > 0) {
                  toast(
                    `Done: ${res.processed_count} processed, ${res.failed_count} failed — check individual emails`,
                    'error',
                  );
                } else {
                  toast(`Successfully processed ${res.processed_count} email(s)`);
                }
                dispatch(fetchEmailsThunk());
              } catch (err) {
                if (isTimeoutError(err)) {
                  setPollingProcess(true);
                  toast('Processing is still running; checking results…');

                  try {
                    const { done, emails: finalEmails } = await pollForIngestedEmails(
                      ingestedIds,
                    );

                    const byId = new Map(
                      finalEmails.map((e) => [e.email_message_id, e.processed_status]),
                    );

                    const failedCount = Array.from(ingestedIds).filter((id) => {
                      const status = byId.get(id) ?? '';
                      return status === 'FAILED' || status === 'NEEDS_REVIEW';
                    }).length;

                    const processedCount = Array.from(ingestedIds).filter((id) => {
                      const status = byId.get(id) ?? '';
                      return status === 'COMPLETED' || status === 'IGNORED';
                    }).length;

                    if (!done) {
                      toast(
                        'Processing is still running. Refresh to see final results.',
                        'error',
                      );
                    } else if (failedCount > 0) {
                      toast(
                        `Done: ${processedCount} processed, ${failedCount} failed — check individual emails`,
                        'error',
                      );
                    } else {
                      toast(`Successfully processed ${processedCount} email(s)`);
                    }
                  } catch {
                    toast('Server error while checking processing results.', 'error');
                  } finally {
                    setPollingProcess(false);
                    dispatch(fetchEmailsThunk());
                  }
                } else {
                  toast(
                    'Server error while processing emails. Please try again.',
                    'error',
                  );
                }
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
            <option value="non_timesheet">Other (Non-timesheet)</option>
          </select>
          <Button
            variant="secondary"
            className="btn--sm"
            onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
          >
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>

        {(processing || reprocessing || pollingProcess) && (
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
            {pollingProcess
              ? 'Processing is taking longer than expected; checking results…'
              : processing
                ? 'Classifying and processing emails — please wait, this may take a moment…'
                : 'Retrying failed emails — please wait…'}
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
                paginated.map((e) => (
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

      <Pagination
        page={page}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

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

