/* ──────────────────────────────────────────────
 *  Audit & review API service – HTTP calls (port 8001)
 * ────────────────────────────────────────────── */
import { servicesApi } from '../lib/axios';
import type {
  ManualReviewItem,
  ApprovalRecord,
  AuditLog,
  AuditDecision,
} from '../types/audit.types';

const MANUAL_REVIEW_PREFIX = '/manual-review';
const APPROVAL_PREFIX = '/approval';
const AUDIT_LOG_PREFIX = '/audit-log';

export const fetchManualReviewsApi = async (): Promise<ManualReviewItem[]> => {
  const { data } = await servicesApi.get<ManualReviewItem[]>(
    `${MANUAL_REVIEW_PREFIX}/get-reviews`,
  );
  return data;
};

export const fetchPendingManualReviewsApi =
  async (): Promise<ManualReviewItem[]> => {
    const { data } = await servicesApi.get<ManualReviewItem[]>(
      `${MANUAL_REVIEW_PREFIX}/pending`,
    );
    return data;
  };

export const submitManualReviewDecisionApi = async (
  reviewId: string,
  payload: {
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
    reviewed_by: string;
  },
): Promise<ManualReviewItem> => {
  const { data } = await servicesApi.put<ManualReviewItem>(
    `${MANUAL_REVIEW_PREFIX}/${reviewId}`,
    payload,
  );
  return data;
};

export const fetchApprovalsApi = async (): Promise<ApprovalRecord[]> => {
  const { data } = await servicesApi.get<ApprovalRecord[]>(
    `${APPROVAL_PREFIX}/get-approvals`,
  );
  return data;
};

export const fetchAuditLogsApi = async (
  params?: Record<string, unknown>,
): Promise<AuditLog[]> => {
  const { data } = await servicesApi.get<AuditLog[]>(`${AUDIT_LOG_PREFIX}`, {
    params,
  });
  return data;
};

