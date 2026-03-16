/* ──────────────────────────────────────────────
 *  User API service – user & role HTTP calls
 * ────────────────────────────────────────────── */
import api from '../../../lib/axios';
import type { User, Role, CreateUserPayload } from '../types/dashboard.types';

const USERS_PREFIX = '/users';

/** GET /users/ – fetch all users */
export const fetchUsersApi = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>(`${USERS_PREFIX}/`);
  return data;
};

/** GET /users/roles – fetch all roles */
export const fetchRolesApi = async (): Promise<Role[]> => {
  const { data } = await api.get<Role[]>(`${USERS_PREFIX}/roles`);
  return data;
};

/** GET /users/:id – fetch single user */
export const fetchUserByIdApi = async (userId: string): Promise<User> => {
  const { data } = await api.get<User>(`${USERS_PREFIX}/${userId}`);
  return data;
};

/** POST /users/ – create a new user */
export const createUserApi = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await api.post<User>(`${USERS_PREFIX}/`, payload);
  return data;
};
