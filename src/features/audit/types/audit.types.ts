/* ──────────────────────────────────────────────
 *  Audit & review domain types – mirrors backend schemas
 * ────────────────────────────────────────────── */

export type AuditDecision = 'APPROVED' | 'REJECTED';

export interface ManualReviewItem {
  review_id: string;
  timesheet_id: string;
  status: string;
  created_at: string;
}

export interface ApprovalRecord {
  approval_id: string;
  timesheet_id: string;
  decision: AuditDecision;
  decided_by: string;
  decided_at: string;
}

export interface AuditLog {
  audit_log_id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditState {
  pendingReviews: ManualReviewItem[];
  approvals: ApprovalRecord[];
  logs: AuditLog[];
  loading: boolean;
  logsLoading: boolean;
  error: string | null;
}

