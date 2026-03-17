/* ──────────────────────────────────────────────
 *  Extracted Timesheets – Admin/Auditor Review
 *  Shows all extracted data with full employee/client names
 *  Supports review, approval, rejection workflow
 * ────────────────────────────────────────────── */
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchExtractedTimesheetsThunk } from './extractedSlice';
import { fetchEmailsThunk } from '../email/emailSlice';
import { approveTimesheetApi, rejectTimesheetApi } from './services/extractedDataService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { toast } from '../../utils/toast';
import config from '../../config/apiConfig';

const statusLabelMap: Record<string, string> = {
    RECEIVED: 'Received',
    EXTRACTED: 'Extracted',
    MATCHED: 'Matched',
    UNMATCHED: 'Unmatched',
    READY_FOR_APPROVAL: 'Ready for approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

const ExtractedTimesheetsPage = () => {
    const dispatch = useAppDispatch();
    const { extractedData, loading } = useAppSelector((s) => s.extracted);
    const { emails } = useAppSelector((s) => s.email);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    /* Email detail modal state */
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchExtractedTimesheetsThunk());
        dispatch(fetchEmailsThunk());
    }, [dispatch]);

    const filtered = useMemo(() => {
        let result = extractedData;
        
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.client_name?.toLowerCase().includes(q) ||
                    t.sender_email?.toLowerCase().includes(q) ||
                    t.week_ending?.toLowerCase().includes(q)
            );
        }
        
        return [...result].sort((a, b) => {
            const dateA = new Date(a.received_at).getTime();
            const dateB = new Date(b.received_at).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [extractedData, search, sortOrder]);

    const openDetail = (timesheet: any) => {
        setSelectedTimesheet(timesheet);
        setDetailOpen(true);
    };

    const handleApprove = async (timesheetId: string) => {
        try {
            await approveTimesheetApi(timesheetId);
            toast('Timesheet approved successfully');
            setDetailOpen(false);
            dispatch(fetchExtractedTimesheetsThunk());
        } catch (error) {
            console.error(`Failed to approve timesheet ${timesheetId}:`, error);
            toast('Failed to approve timesheet', 'error');
        }
    };

    const handleReject = async (timesheetId: string) => {
        try {
            await rejectTimesheetApi(timesheetId);
            toast('Timesheet rejected successfully');
            setDetailOpen(false);
            dispatch(fetchExtractedTimesheetsThunk());
        } catch (error) {
            console.error(`Failed to reject timesheet ${timesheetId}:`, error);
            toast('Failed to reject timesheet', 'error');
        }
    };

    const openEmailModal = (emailMessageId: string) => {
        setSelectedEmailId(emailMessageId);
        setEmailModalOpen(true);
    };

    const selectedEmail = emails.find((e) => e.email_message_id === selectedEmailId) ?? null;

    return (
        <>
            <div className="page-header">
                <h3 className="page-header__title">Extracted Timesheets</h3>
                <Button
                    className="btn--sm"
                    onClick={() => dispatch(fetchExtractedTimesheetsThunk())}
                >
                    Refresh
                </Button>
            </div>

            <div className="table-wrap">
                <div className="table-toolbar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        className="table-toolbar__input"
                        type="text"
                        placeholder="Search by client, sender email, or week…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button 
                        variant="ghost" 
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    >
                        Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </Button>
                </div>

                {loading ? (
                    <div className="no-data" style={{ padding: '2rem' }}>
                        Loading extracted timesheets…
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Received</th>
                                <th>Sender</th>
                                <th>Client</th>
                                <th>Week Ending</th>
                                <th>Status</th>
                                <th>Confidence</th>
                                <th>Entries</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="no-data">
                                        No extracted timesheets found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.timesheet_id}>
                                        <td>{new Date(t.received_at).toLocaleString()}</td>
                                        <td>{t.sender_email}</td>
                                        <td>{t.client_name}</td>
                                        <td>{t.week_ending ?? '—'}</td>
                                        <td>
                                            <Badge
                                                variant={
                                                    t.status === 'APPROVED'
                                                        ? 'active'
                                                        : t.status === 'REJECTED'
                                                            ? 'inactive'
                                                            : 'info'
                                                }
                                            >
                                                {statusLabelMap[t.status] || t.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {t.extraction_confidence
                                                ? `${(t.extraction_confidence * 100).toFixed(0)}%`
                                                : '—'}
                                        </td>
                                        <td>{t.entries.length}</td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                variant="ghost"
                                                className="btn--sm"
                                                onClick={() => openDetail(t)}
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="btn--sm"
                                                onClick={() => openEmailModal(t.email_message_id)}
                                            >
                                                View Source Email
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedTimesheet && (
                <Modal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    title={`Timesheet Review: ${selectedTimesheet.client_name}`}
                    actions={
                        <>
                            <Button
                                variant="secondary"
                                disabled={selectedTimesheet.status === 'APPROVED' || selectedTimesheet.status === 'REJECTED'}
                                onClick={() =>
                                    handleReject(selectedTimesheet.timesheet_id)
                                }
                            >
                                Reject
                            </Button>
                            <Button
                                className="btn--primary"
                                disabled={selectedTimesheet.status === 'APPROVED' || selectedTimesheet.status === 'REJECTED'}
                                onClick={() =>
                                    handleApprove(selectedTimesheet.timesheet_id)
                                }
                            >
                                Approve
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setDetailOpen(false)}
                            >
                                Close
                            </Button>
                        </>
                    }
                >
                    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        <div className="detail-section">
                            <h4>Email Details</h4>
                            <div className="detail-row">
                                <span className="detail-label">Sender</span>
                                <span>{selectedTimesheet.sender_email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Received</span>
                                <span>
                                    {new Date(selectedTimesheet.received_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Week Ending</span>
                                <span>{selectedTimesheet.week_ending || '—'}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Timesheet Entries</h4>
                            {selectedTimesheet.entries.length === 0 ? (
                                <p>No entries found</p>
                            ) : (
                                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Date</th>
                                            <th>Regular</th>
                                            <th>OT</th>
                                            <th>2x</th>
                                            <th>Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTimesheet.entries.map((entry: any) => (
                                            <tr key={entry.timeentry_id}>
                                                <td>{entry.employee_name || '—'}</td>
                                                <td>{entry.start_time ? new Date(entry.start_time).toLocaleDateString() : '—'}</td>
                                                <td>{entry.regular_hours}</td>
                                                <td>{entry.overtime_hours}</td>
                                                <td>{entry.double_time_hours}</td>
                                                <td>{entry.paycode_code || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Source Email Detail modal */}
            <Modal
                open={emailModalOpen}
                onClose={() => setEmailModalOpen(false)}
                title="Source Email"
                size="lg"
                actions={
                    <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>Close</Button>
                }
            >
                {selectedEmail ? (
                    <>
                        <div className="detail-row">
                            <span className="detail-label">Sender</span>
                            <span>{selectedEmail.sender_email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Received At</span>
                            <span>{new Date(selectedEmail.received_at).toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Subject</span>
                            <span>{selectedEmail.subject ?? '—'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Classification</span>
                            <span>{selectedEmail.classification ?? '—'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Processed Status</span>
                            <span>{selectedEmail.processed_status ?? '—'}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                            <strong>Body Preview</strong>
                            <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                                {selectedEmail.body ?? 'No body available'}
                            </p>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                            <strong>Attachments</strong>
                            {selectedEmail.attachments.length === 0 ? (
                                <p style={{ marginTop: '0.25rem' }}>No attachments</p>
                            ) : (
                                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                                    {selectedEmail.attachments.map((att) => (
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
                    </>
                ) : (
                    <div className="no-data">
                        Email not found. The source email may not have been loaded yet.
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ExtractedTimesheetsPage;
