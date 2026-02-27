/* ──────────────────────────────────────────────
 *  Auth domain types – mirrors FastAPI schemas
 * ────────────────────────────────────────────── */

// ── Signup ────────────────────────────────────
export interface SignupPayload {
  name: string;
  email: string;
  contact_no: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user_id: string;
  user_name: string;
  email: string;
  role: string;
}

// ── Login ─────────────────────────────────────
/** FastAPI expects OAuth2PasswordRequestForm  → x-www-form-urlencoded */
export interface LoginPayload {
  username: string; // email used as username
  password: string;
}

/**
 * The server returns access_token in the JSON body and sets
 * refresh_token as an httpOnly cookie (not accessible via JS).
 * The `refresh_token` field may still appear in the response
 * body for documentation but MUST NOT be stored client-side.
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ── Auth slice state ──────────────────────────
export interface AuthState {
  user: Pick<SignupResponse, 'user_id' | 'user_name' | 'email' | 'role'> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signupSuccess: boolean;
}

// ── Forgot Password ───────────────────────────
export interface ForgotPasswordRequestPayload {
  email: string;
}

export interface ForgotPasswordVerifyPayload {
  email: string;
  otp: string;
  new_password: string;
}

// ── API Error ─────────────────────────────────
export interface ApiErrorResponse {
  detail?: string | { msg: string }[];
}
