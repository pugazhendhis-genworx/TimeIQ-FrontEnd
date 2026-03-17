/* ──────────────────────────────────────────────
 *  Audit & review feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchManualReviewsApi,
  fetchPendingManualReviewsApi,
  submitManualReviewDecisionApi,
  fetchApprovalsApi,
  fetchAuditLogsApi,
} from './services/auditService';
import type {
  AuditState,
  AuditDecision,
} from './types/audit.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: AuditState = {
  pendingReviews: [],
  approvals: [],
  logs: [],
  loading: false,
  logsLoading: false,
  error: null,
};

export const fetchPendingReviewsThunk = createAsyncThunk(
  'audit/fetchPendingReviews',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPendingManualReviewsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchAllReviewsThunk = createAsyncThunk(
  'audit/fetchAllReviews',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchManualReviewsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const submitReviewDecisionThunk = createAsyncThunk(
  'audit/submitReviewDecision',
  async (
    args: { reviewId: string; decision: AuditDecision; comment?: string },
    { rejectWithValue, getState },
  ) => {
    try {
      const { reviewId, decision, comment } = args;
      const state = getState() as any;
      const userId = state.auth?.user?.user_id;

      if (!userId) {
        return rejectWithValue('User not authenticated');
      }

      return await submitManualReviewDecisionApi(reviewId, {
        status: decision,
        comments: comment,
        reviewed_by: userId,
      });
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchApprovalsThunk = createAsyncThunk(
  'audit/fetchApprovals',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchApprovalsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchAuditLogsThunk = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await fetchAuditLogsApi(params);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearAuditError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingReviewsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingReviewsThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingReviews = payload;
      })
      .addCase(fetchPendingReviewsThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch pending reviews';
      });

    builder.addCase(fetchAllReviewsThunk.fulfilled, (state, { payload }) => {
      state.pendingReviews = payload;
    });

    builder
      .addCase(submitReviewDecisionThunk.fulfilled, (state, { payload }) => {
        const idx = state.pendingReviews.findIndex(
          (r) => r.review_id === payload.review_id,
        );
        if (idx !== -1) {
          state.pendingReviews[idx] = payload;
        }
      });

    builder
      .addCase(fetchApprovalsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApprovalsThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.approvals = payload;
      })
      .addCase(fetchApprovalsThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch approvals';
      });

    builder
      .addCase(fetchAuditLogsThunk.pending, (state) => {
        state.logsLoading = true;
      })
      .addCase(fetchAuditLogsThunk.fulfilled, (state, { payload }) => {
        state.logsLoading = false;
        state.logs = payload;
      })
      .addCase(fetchAuditLogsThunk.rejected, (state, { payload }) => {
        state.logsLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch audit logs';
      });
  },
});

export const { clearAuditError } = auditSlice.actions;
export default auditSlice.reducer;

