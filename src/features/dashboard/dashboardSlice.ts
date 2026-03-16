/* ──────────────────────────────────────────────
 *  Dashboard feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersApi,
  fetchRolesApi,
  fetchUserByIdApi,
  createUserApi,
} from './services/userService';
import type { DashboardState, CreateUserPayload } from './types/dashboard.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

/* ── Initial state ────────────────────────────── */
const initialState: DashboardState = {
  users: [],
  roles: [],
  selectedUser: null,
  usersLoading: false,
  rolesLoading: false,
  createUserLoading: false,
  error: null,
};

/* ── Async thunks ────────────────────────────── */
export const fetchUsersThunk = createAsyncThunk(
  'dashboard/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchUsersApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchRolesThunk = createAsyncThunk(
  'dashboard/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchRolesApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const fetchUserByIdThunk = createAsyncThunk(
  'dashboard/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await fetchUserByIdApi(userId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createUserThunk = createAsyncThunk(
  'dashboard/createUser',
  async (payload: CreateUserPayload, { rejectWithValue }) => {
    try {
      return await createUserApi(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

/* ── Slice ───────────────────────────────────── */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    /* Fetch Users */
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, { payload }) => {
        state.usersLoading = false;
        state.users = payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, { payload }) => {
        state.usersLoading = false;
        state.error = (payload as string) ?? 'Failed to fetch users';
      });

    /* Fetch Roles */
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.rolesLoading = true;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, { payload }) => {
        state.rolesLoading = false;
        state.roles = payload;
      })
      .addCase(fetchRolesThunk.rejected, (state, { payload }) => {
        state.rolesLoading = false;
        state.error = (payload as string) ?? 'Failed to fetch roles';
      });

    /* Fetch User By Id */
    builder
      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.selectedUser = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, { payload }) => {
        state.selectedUser = payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, { payload }) => {
        state.error = (payload as string) ?? 'Failed to fetch user';
      });

    /* Create User */
    builder
      .addCase(createUserThunk.pending, (state) => {
        state.createUserLoading = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, { payload }) => {
        state.createUserLoading = false;
        state.users.push(payload);
      })
      .addCase(createUserThunk.rejected, (state, { payload }) => {
        state.createUserLoading = false;
        state.error = (payload as string) ?? 'Failed to create user';
      });
  },
});

export const { clearDashboardError, clearSelectedUser } = dashboardSlice.actions;
export default dashboardSlice.reducer;
