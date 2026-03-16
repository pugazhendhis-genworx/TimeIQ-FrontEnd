/* ──────────────────────────────────────────────
 *  Client API service – client HTTP calls
 * ────────────────────────────────────────────── */
import { servicesApi } from '../../../lib/axios';
import type { Client, CreateClientPayload } from '../types/client.types';

const CLIENTS_PREFIX = '/client';

/** GET /client/get-clients – fetch all clients */
export const fetchClientsApi = async (): Promise<Client[]> => {
  const { data } = await servicesApi.get<Client[]>(`${CLIENTS_PREFIX}/get-clients`);
  return data;
};

/** POST /client/add-clients – create a new client */
export const createClientApi = async (payload: CreateClientPayload): Promise<Client> => {
  const { data } = await servicesApi.post<Client>(`${CLIENTS_PREFIX}/add-clients`, payload);
  return data;
};

/** PATCH /client/:id/toggle-status – toggle active/inactive */
export const toggleClientStatusApi = async (clientId: string): Promise<Client> => {
  const { data } = await servicesApi.patch<Client>(`${CLIENTS_PREFIX}/${clientId}/toggle-status`);
  return data;
};
