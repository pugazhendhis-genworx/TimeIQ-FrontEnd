/* ──────────────────────────────────────────────
 *  Email Whitelist API service – HTTP calls (port 8001)
 * ────────────────────────────────────────────── */
import { servicesApi } from '../lib/axios';
import type { EmailWhitelist, CreateWhitelistPayload } from '../types/whitelist.types';

const PREFIX = '/whitelist';

/** GET /whitelist/get-all-whitelisted-emails */
export const fetchWhitelistsApi = async (): Promise<EmailWhitelist[]> => {
  const { data } = await servicesApi.get<EmailWhitelist[]>(
    `${PREFIX}/get-all-whitelisted-emails`,
  );
  return data;
};

/** GET /whitelist/:client_id */
export const fetchWhitelistByClientApi = async (
  clientId: string,
): Promise<EmailWhitelist> => {
  const { data } = await servicesApi.get<EmailWhitelist>(
    `${PREFIX}/${clientId}`,
  );
  return data;
};

/** POST /whitelist/add_email */
export const createWhitelistApi = async (
  payload: CreateWhitelistPayload,
): Promise<EmailWhitelist> => {
  const { data } = await servicesApi.post<EmailWhitelist>(
    `${PREFIX}/add_email`,
    payload,
  );
  return data;
};
