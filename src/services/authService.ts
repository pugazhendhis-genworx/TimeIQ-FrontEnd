/* ──────────────────────────────────────────────
 *  Auth API service – all auth HTTP calls live here
 * ────────────────────────────────────────────── */
import api from '../lib/axios';
import type {
  LoginPayload,
  SignupPayload,
  SignupResponse,
  TokenResponse,
} from '../types/auth.types';

const AUTH_PREFIX = '/auth';

/** POST /auth/signup  (JSON body) */
export const signupApi = async (payload: SignupPayload): Promise<SignupResponse> => {
  const { data } = await api.post<SignupResponse>(`${AUTH_PREFIX}/signup`, payload);
  return data;
};

/**
 * POST /auth/login  (x-www-form-urlencoded — OAuth2PasswordRequestForm)
 *
 * The server returns { access_token, token_type } in the JSON body
 * and sets the refresh_token as an httpOnly cookie automatically.
 * We store the access_token in the Authorization header for future calls.
 */
export const loginApi = async (payload: LoginPayload): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);

  const { data } = await api.post<TokenResponse>(`${AUTH_PREFIX}/login`, formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  /* Set the access token for all subsequent requests */
  api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

  return data;
};

/** POST /auth/refresh */
export const refreshApi = async (): Promise<TokenResponse> => {
  const { data } = await api.post<TokenResponse>(`${AUTH_PREFIX}/refresh`);
  return data;
};

/** POST /auth/forgot_password/request — sends OTP to email */
export const forgotPasswordRequestApi = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>(
    `${AUTH_PREFIX}/forgot_password/request`,
    { email },
  );
  return data;
};

/** POST /auth/forgot_password/verify — verifies OTP and sets new password */
export const forgotPasswordVerifyApi = async (payload: {
  email: string;
  otp: string;
  new_password: string;
}): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>(
    `${AUTH_PREFIX}/forgot_password/verify`,
    payload,
  );
  return data;
};

/** POST /auth/logout — server clears the httpOnly refresh cookie */
export const logoutApi = async (): Promise<void> => {
  await api.post(`${AUTH_PREFIX}/logout`);
  delete api.defaults.headers.common.Authorization;
};
