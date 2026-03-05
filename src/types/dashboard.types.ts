/* ──────────────────────────────────────────────
 *  Dashboard domain types – mirrors backend schemas
 * ────────────────────────────────────────────── */

export interface User {
  user_id: string;
  name: string;
  email: string;
  contact_no: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Role {
  role_id: string;
  name: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  contact_no: string;
  password: string;
  role_name: string;
}

export interface DashboardState {
  users: User[];
  roles: Role[];
  selectedUser: User | null;
  usersLoading: boolean;
  rolesLoading: boolean;
  createUserLoading: boolean;
  error: string | null;
}
