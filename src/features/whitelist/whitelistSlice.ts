/* ──────────────────────────────────────────────
 *  Email Whitelist feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchWhitelistsApi,
  createWhitelistApi,
} from './services/whitelistService';
import type {
  WhitelistState,
  CreateWhitelistPayload,
} from './types/whitelist.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

/* ── Initial state ────────────────────────────── */
const initialState: WhitelistState = {
  whitelists: [],
  whitelistsLoading: false,
  createWhitelistLoading: false,
  error: null,
};

/* ── Async thunks ────────────────────────────── */
export const fetchWhitelistsThunk = createAsyncThunk(
  'whitelist/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWhitelistsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createWhitelistThunk = createAsyncThunk(
  'whitelist/create',
  async (payload: CreateWhitelistPayload, { rejectWithValue }) => {
    try {
      return await createWhitelistApi(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

/* ── Slice ───────────────────────────────────── */
const whitelistSlice = createSlice({
  name: 'whitelist',
  initialState,
  reducers: {
    clearWhitelistError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* Fetch all */
    builder
      .addCase(fetchWhitelistsThunk.pending, (state) => {
        state.whitelistsLoading = true;
        state.error = null;
      })
      .addCase(fetchWhitelistsThunk.fulfilled, (state, { payload }) => {
        state.whitelistsLoading = false;
        state.whitelists = payload;
      })
      .addCase(fetchWhitelistsThunk.rejected, (state, { payload }) => {
        state.whitelistsLoading = false;
        state.error = (payload as string) ?? 'Failed to fetch whitelists';
      });

    /* Create */
    builder
      .addCase(createWhitelistThunk.pending, (state) => {
        state.createWhitelistLoading = true;
        state.error = null;
      })
      .addCase(createWhitelistThunk.fulfilled, (state, { payload }) => {
        state.createWhitelistLoading = false;
        state.whitelists.push(payload);
      })
      .addCase(createWhitelistThunk.rejected, (state, { payload }) => {
        state.createWhitelistLoading = false;
        state.error = (payload as string) ?? 'Failed to add whitelisted email';
      });
  },
});

export const { clearWhitelistError } = whitelistSlice.actions;
export default whitelistSlice.reducer;
