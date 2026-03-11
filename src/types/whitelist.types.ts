/* ──────────────────────────────────────────────
 *  Email Whitelist domain types – mirrors backend schemas
 * ────────────────────────────────────────────── */

export interface EmailWhitelist {
  email_whitelist_id: string;
  client_id: string;
  allowed_email: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateWhitelistPayload {
  client_id: string;
  allowed_email: string;
}

export interface WhitelistState {
  whitelists: EmailWhitelist[];
  whitelistsLoading: boolean;
  createWhitelistLoading: boolean;
  error: string | null;
}
