/* ──────────────────────────────────────────────
 *  Client feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchClientsApi,
  createClientApi,
  toggleClientStatusApi,
} from '../../services/clientService';
import type { ClientState, CreateClientPayload } from '../../types/client.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

/* ── Initial state ────────────────────────────── */
const initialState: ClientState = {
  clients: [],
  clientsLoading: false,
  createClientLoading: false,
  toggleStatusLoading: false,
  error: null,
};

/* ── Async thunks ────────────────────────────── */
export const fetchClientsThunk = createAsyncThunk(
  'client/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchClientsApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createClientThunk = createAsyncThunk(
  'client/createClient',
  async (payload: CreateClientPayload, { rejectWithValue }) => {
    try {
      return await createClientApi(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const toggleClientStatusThunk = createAsyncThunk(
  'client/toggleStatus',
  async (clientId: string, { rejectWithValue }) => {
    try {
      return await toggleClientStatusApi(clientId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

/* ── Slice ───────────────────────────────────── */
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearClientError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* Fetch Clients */
    builder
      .addCase(fetchClientsThunk.pending, (state) => {
        state.clientsLoading = true;
        state.error = null;
      })
      .addCase(fetchClientsThunk.fulfilled, (state, { payload }) => {
        state.clientsLoading = false;
        state.clients = payload;
      })
      .addCase(fetchClientsThunk.rejected, (state, { payload }) => {
        state.clientsLoading = false;
        state.error = (payload as string) ?? 'Failed to fetch clients';
      });

    /* Create Client */
    builder
      .addCase(createClientThunk.pending, (state) => {
        state.createClientLoading = true;
        state.error = null;
      })
      .addCase(createClientThunk.fulfilled, (state, { payload }) => {
        state.createClientLoading = false;
        state.clients.push(payload);
      })
      .addCase(createClientThunk.rejected, (state, { payload }) => {
        state.createClientLoading = false;
        state.error = (payload as string) ?? 'Failed to create client';
      });

    /* Toggle Status */
    builder
      .addCase(toggleClientStatusThunk.pending, (state) => {
        state.toggleStatusLoading = true;
        state.error = null;
      })
      .addCase(toggleClientStatusThunk.fulfilled, (state, { payload }) => {
        state.toggleStatusLoading = false;
        const idx = state.clients.findIndex((c) => c.client_id === payload.client_id);
        if (idx !== -1) state.clients[idx] = payload;
      })
      .addCase(toggleClientStatusThunk.rejected, (state, { payload }) => {
        state.toggleStatusLoading = false;
        state.error = (payload as string) ?? 'Failed to toggle client status';
      });
  },
});

export const { clearClientError } = clientSlice.actions;
export default clientSlice.reducer;
