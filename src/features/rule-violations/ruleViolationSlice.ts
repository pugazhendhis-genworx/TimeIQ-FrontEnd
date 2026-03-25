import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchFlaggedTimesheetsApi,
  fetchViolationDetailApi,
} from './services/ruleViolationService';
import type { RuleViolationState, RuleViolationDetail } from './types/ruleViolation.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: RuleViolationState = {
  flaggedList: [],
  flaggedListLoading: false,
  detailByTimesheetId: {},
  detailLoadingTimesheetId: null,
  error: null,
};

export const fetchFlaggedTimesheetsThunk = createAsyncThunk(
  'ruleViolation/fetchFlagged',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchFlaggedTimesheetsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchViolationDetailThunk = createAsyncThunk(
  'ruleViolation/fetchDetail',
  async (timesheetId: string, { rejectWithValue }) => {
    try {
      const detail = await fetchViolationDetailApi(timesheetId);
      return { timesheetId, detail };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const ruleViolationSlice = createSlice({
  name: 'ruleViolation',
  initialState,
  reducers: {
    clearRuleViolationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlaggedTimesheetsThunk.pending, (state) => {
        state.flaggedListLoading = true;
        state.error = null;
      })
      .addCase(fetchFlaggedTimesheetsThunk.fulfilled, (state, { payload }) => {
        state.flaggedListLoading = false;
        state.flaggedList = payload;
      })
      .addCase(fetchFlaggedTimesheetsThunk.rejected, (state, { payload }) => {
        state.flaggedListLoading = false;
        state.error = (payload as string) ?? 'Failed to load rule violations';
      });

    builder
      .addCase(fetchViolationDetailThunk.pending, (state, { meta }) => {
        state.detailLoadingTimesheetId = meta.arg;
        state.error = null;
      })
      .addCase(
        fetchViolationDetailThunk.fulfilled,
        (
          state,
          {
            payload,
          }: { payload: { timesheetId: string; detail: RuleViolationDetail } },
        ) => {
          state.detailLoadingTimesheetId = null;
          state.detailByTimesheetId[payload.timesheetId] = payload.detail;
        },
      )
      .addCase(fetchViolationDetailThunk.rejected, (state, { payload }) => {
        state.detailLoadingTimesheetId = null;
        state.error = (payload as string) ?? 'Failed to load violation detail';
      });
  },
});

export const { clearRuleViolationError } = ruleViolationSlice.actions;
export default ruleViolationSlice.reducer;
