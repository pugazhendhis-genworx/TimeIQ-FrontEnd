/* ──────────────────────────────────────────────
 *  Extracted data feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    fetchExtractedTimesheetsApi,
    fetchExtractedTimesheetByIdApi,
} from '../../services/extractedDataService';
import type { ExtractionState } from '../../types/extracted.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: ExtractionState = {
    extractedData: [],
    loading: false,
    error: null,
};

export const fetchExtractedTimesheetsThunk = createAsyncThunk(
    'extracted/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchExtractedTimesheetsApi();
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

export const fetchExtractedTimesheetByIdThunk = createAsyncThunk(
    'extracted/fetchById',
    async (timesheetId: string, { rejectWithValue }) => {
        try {
            return await fetchExtractedTimesheetByIdApi(timesheetId);
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

const extractedSlice = createSlice({
    name: 'extracted',
    initialState,
    reducers: {
        clearExtractedError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExtractedTimesheetsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchExtractedTimesheetsThunk.fulfilled,
                (state, { payload }) => {
                    state.loading = false;
                    state.extractedData = payload;
                },
            )
            .addCase(fetchExtractedTimesheetsThunk.rejected, (state, { payload }) => {
                state.loading = false;
                state.error =
                    (payload as string) ?? 'Failed to fetch extracted timesheets';
            });
    },
});

export const { clearExtractedError } = extractedSlice.actions;
export default extractedSlice.reducer;
