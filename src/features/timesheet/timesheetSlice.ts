/* ──────────────────────────────────────────────
 *  Timesheet feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchTimesheetsApi,
  fetchTimesheetsByStatusApi,
  fetchTimesheetsByClientApi,
  fetchTimesheetEntriesApi,
  fetchTimesheetByIdApi,
  submitTimesheetForApprovalApi,
  updateTimesheetApi,
  fetchExtractedTimesheetByIdApi,
} from '../../services/timesheetService';
import type {
  TimesheetState,
  TimesheetFilters,
  Timesheet,
  TimeEntryRaw,
  ExtractedTimesheetDisplay,
} from '../../types/timesheet.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: TimesheetState = {
  timesheets: [],
  entriesByTimesheetId: {},
  extractedById: {},
  selectedTimesheetId: null,
  timesheetsLoading: false,
  entriesLoading: false,
  extractedLoading: false,
  updateTimesheetLoading: false,
  submitForApprovalLoading: false,
  filters: {},
  error: null,
};

export const fetchTimesheetsThunk = createAsyncThunk(
  'timesheet/fetchTimesheets',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTimesheetsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchTimesheetsByStatusThunk = createAsyncThunk(
  'timesheet/fetchTimesheetsByStatus',
  async (status: string, { rejectWithValue }) => {
    try {
      return await fetchTimesheetsByStatusApi(status);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchTimesheetsByClientThunk = createAsyncThunk(
  'timesheet/fetchTimesheetsByClient',
  async (clientId: string, { rejectWithValue }) => {
    try {
      return await fetchTimesheetsByClientApi(clientId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchTimesheetEntriesThunk = createAsyncThunk(
  'timesheet/fetchTimesheetEntries',
  async (timesheetId: string, { rejectWithValue }) => {
    try {
      const [header, entries] = await Promise.all([
        fetchTimesheetByIdApi(timesheetId),
        fetchTimesheetEntriesApi(timesheetId),
      ]);
      return { header, entries };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const submitForApprovalThunk = createAsyncThunk(
  'timesheet/submitForApproval',
  async (timesheetId: string, { rejectWithValue }) => {
    try {
      return await submitTimesheetForApprovalApi(timesheetId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updateTimesheetThunk = createAsyncThunk(
  'timesheet/updateTimesheet',
  async (
    args: { timesheetId: string; payload: Partial<Timesheet> },
    { rejectWithValue },
  ) => {
    try {
      const { timesheetId, payload } = args;
      return await updateTimesheetApi(timesheetId, payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchExtractedTimesheetThunk = createAsyncThunk(
  'timesheet/fetchExtractedTimesheet',
  async (timesheetId: string, { rejectWithValue }) => {
    try {
      return await fetchExtractedTimesheetByIdApi(timesheetId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setTimesheetFilters(state, { payload }: { payload: TimesheetFilters }) {
      state.filters = payload;
    },
    selectTimesheet(state, { payload }: { payload: string | null }) {
      state.selectedTimesheetId = payload;
    },
    clearTimesheetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheetsThunk.pending, (state) => {
        state.timesheetsLoading = true;
        state.error = null;
      })
      .addCase(fetchTimesheetsThunk.fulfilled, (state, { payload }) => {
        state.timesheetsLoading = false;
        state.timesheets = payload;
      })
      .addCase(fetchTimesheetsThunk.rejected, (state, { payload }) => {
        state.timesheetsLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch timesheets';
      });

    builder
      .addCase(fetchTimesheetsByStatusThunk.fulfilled, (state, { payload }) => {
        state.timesheets = payload;
      })
      .addCase(fetchTimesheetsByClientThunk.fulfilled, (state, { payload }) => {
        state.timesheets = payload;
      });

    builder
      .addCase(fetchTimesheetEntriesThunk.pending, (state) => {
        state.entriesLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTimesheetEntriesThunk.fulfilled,
        (
          state,
          {
            payload,
          }: { payload: { header: Timesheet; entries: TimeEntryRaw[] } },
        ) => {
          state.entriesLoading = false;
          state.selectedTimesheetId = payload.header.timesheet_id;
          state.entriesByTimesheetId[payload.header.timesheet_id] =
            payload.entries;
        },
      )
      .addCase(fetchTimesheetEntriesThunk.rejected, (state, { payload }) => {
        state.entriesLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch timesheet entries';
      });

    builder
      .addCase(submitForApprovalThunk.pending, (state) => {
        state.submitForApprovalLoading = true;
        state.error = null;
      })
      .addCase(submitForApprovalThunk.fulfilled, (state, { payload }) => {
        state.submitForApprovalLoading = false;
        const idx = state.timesheets.findIndex(
          (t) => t.timesheet_id === payload.timesheet_id,
        );
        if (idx !== -1) state.timesheets[idx] = payload;
      })
      .addCase(submitForApprovalThunk.rejected, (state, { payload }) => {
        state.submitForApprovalLoading = false;
        state.error =
          (payload as string) ?? 'Failed to submit timesheet for approval';
      });

    builder
      .addCase(updateTimesheetThunk.pending, (state) => {
        state.updateTimesheetLoading = true;
        state.error = null;
      })
      .addCase(updateTimesheetThunk.fulfilled, (state, { payload }) => {
        state.updateTimesheetLoading = false;
        const idx = state.timesheets.findIndex(
          (t) => t.timesheet_id === payload.timesheet_id,
        );
        if (idx !== -1) state.timesheets[idx] = payload;
      })
      .addCase(updateTimesheetThunk.rejected, (state, { payload }) => {
        state.updateTimesheetLoading = false;
        state.error =
          (payload as string) ?? 'Failed to update timesheet';
      });

    builder
      .addCase(fetchExtractedTimesheetThunk.pending, (state) => {
        state.extractedLoading = true;
        state.error = null;
      })
      .addCase(
        fetchExtractedTimesheetThunk.fulfilled,
        (state, { payload }: { payload: ExtractedTimesheetDisplay }) => {
          state.extractedLoading = false;
          state.selectedTimesheetId = payload.timesheet_id;
          state.extractedById[payload.timesheet_id] = payload;
        },
      )
      .addCase(fetchExtractedTimesheetThunk.rejected, (state, { payload }) => {
        state.extractedLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch extracted timesheet data';
      });
  },
});

export const {
  setTimesheetFilters,
  selectTimesheet,
  clearTimesheetError,
} = timesheetSlice.actions;
export default timesheetSlice.reducer;

