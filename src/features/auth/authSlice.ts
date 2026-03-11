/* ──────────────────────────────────────────────
 *  Auth feature – Redux slice (createAsyncThunk)
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  loginApi,
  logoutApi,
  signupApi,
  validateApi,
  setAuthToken,
  clearAuthToken,
} from '../../services/authService';
import type {
  AuthState,
  LoginPayload,
  SignupPayload,
} from '../../types/auth.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

/* ── Initial state ────────────────────────────── */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  signupSuccess: false,
};

/* ── Async thunks ────────────────────────────── */
export const signupThunk = createAsyncThunk(
  'auth/signup',
  async (payload: SignupPayload, { rejectWithValue }) => {
    try {
      return await signupApi(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const tokenRes = await loginApi(payload);
      const user = await validateApi();
      return { access_token: tokenRes.access_token, user };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

/**
 * initAuthThunk – restore session from localStorage token on page refresh.
 * Called by ProtectedRoute on mount when not authenticated.
 */
export const initAuthThunk = createAsyncThunk(
  'auth/init',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return rejectWithValue('No stored token');
    setAuthToken(token);
    try {
      const user = await validateApi();
      return { access_token: token, user };
    } catch {
      clearAuthToken();
      localStorage.removeItem('access_token');
      return rejectWithValue('Session expired');
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

/* ── Slice ───────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    resetSignupSuccess(state) {
      state.signupSuccess = false;
    },
  },
  extraReducers: (builder) => {
    /* signup */
    builder
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupSuccess = false;
      })
      .addCase(signupThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.signupSuccess = true;
        state.user = {
          user_id: payload.user_id,
          user_name: payload.user_name,
          email: payload.email,
          role: payload.role,
        };
      })
      .addCase(signupThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = (payload as string) ?? 'Signup failed';
      });

    /* login */
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = payload.access_token;
        state.user = {
          user_id: payload.user.user_id,
          role: payload.user.role,
        };
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = (payload as string) ?? 'Login failed';
      });

    /* init auth (session restore) */
    builder
      .addCase(initAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(initAuthThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = payload.access_token;
        state.user = {
          user_id: payload.user.user_id,
          role: payload.user.role,
        };
      })
      .addCase(initAuthThunk.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    /* logout */
    builder
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearAuthError, resetSignupSuccess } = authSlice.actions;
export default authSlice.reducer;
