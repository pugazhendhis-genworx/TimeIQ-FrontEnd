/* ──────────────────────────────────────────────
 *  Client domain types – mirrors backend schemas
 * ────────────────────────────────────────────── */

export interface Client {
  client_id: string;
  client_name: string;
  client_code: string;
  client_email: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface CreateClientPayload {
  client_name: string;
  client_code: string;
  client_email: string;
  created_by: string;
}

export interface ClientState {
  clients: Client[];
  clientsLoading: boolean;
  createClientLoading: boolean;
  toggleStatusLoading: boolean;
  error: string | null;
}
