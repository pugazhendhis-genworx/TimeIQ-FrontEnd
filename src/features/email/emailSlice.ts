/* ──────────────────────────────────────────────
 *  Email feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchEmailsApi,
  fetchTimesheetEmailsApi,
  processAllEmailsApi,
  reprocessFailedEmailsApi,
} from './services/emailService';
import type { EmailState } from './types/email.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: EmailState = {
  emails: [],
  timesheetEmails: [],
  emailsLoading: false,
  timesheetEmailsLoading: false,
  processing: false,
  reprocessing: false,
  error: null,
};

export const fetchEmailsThunk = createAsyncThunk(
  'email/fetchEmails',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchEmailsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const processAllEmailsThunk = createAsyncThunk(
  'email/processAll',
  async (_, { rejectWithValue }) => {
    try {
      return await processAllEmailsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const reprocessFailedEmailsThunk = createAsyncThunk(
  'email/reprocessFailed',
  async (_, { rejectWithValue }) => {
    try {
      return await reprocessFailedEmailsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);


export const fetchTimesheetEmailsThunk = createAsyncThunk(
  'email/fetchTimesheetEmails',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTimesheetEmailsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearEmailError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailsThunk.pending, (state) => {
        state.emailsLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailsThunk.fulfilled, (state, { payload }) => {
        state.emailsLoading = false;
        state.emails = payload;
      })
      .addCase(fetchEmailsThunk.rejected, (state, { payload }) => {
        state.emailsLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch emails';
      });

    builder
      .addCase(fetchTimesheetEmailsThunk.pending, (state) => {
        state.timesheetEmailsLoading = true;
        state.error = null;
      })
      .addCase(fetchTimesheetEmailsThunk.fulfilled, (state, { payload }) => {
        state.timesheetEmailsLoading = false;
        state.timesheetEmails = payload;
      })
      .addCase(fetchTimesheetEmailsThunk.rejected, (state, { payload }) => {
        state.timesheetEmailsLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch timesheet emails';
      });

    /* Bulk processing */
    builder
      .addCase(processAllEmailsThunk.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processAllEmailsThunk.fulfilled, (state) => {
        state.processing = false;
      })
      .addCase(processAllEmailsThunk.rejected, (state, { payload }) => {
        state.processing = false;
        state.error =
          (payload as string) ?? 'Failed to process emails';
      });

    /* Reprocess failed */
    builder
      .addCase(reprocessFailedEmailsThunk.pending, (state) => {
        state.reprocessing = true;
        state.error = null;
      })
      .addCase(reprocessFailedEmailsThunk.fulfilled, (state) => {
        state.reprocessing = false;
      })
      .addCase(reprocessFailedEmailsThunk.rejected, (state, { payload }) => {
        state.reprocessing = false;
        state.error =
          (payload as string) ?? 'Failed to reprocess failed emails';
      });
  },
});

export const { clearEmailError } = emailSlice.actions;
export default emailSlice.reducer;

