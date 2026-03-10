/* ──────────────────────────────────────────────
 *  Email API service – HTTP calls (port 8001)
 * ────────────────────────────────────────────── */
import { servicesApi } from '../lib/axios';
import type { EmailMessage } from '../types/email.types';

const EMAIL_PREFIX = '';
const EMAIL_PROCESSING_PREFIX = '/email-processing';

export const fetchEmailsApi = async (): Promise<EmailMessage[]> => {
  const { data } = await servicesApi.get<EmailMessage[]>(
    `${EMAIL_PREFIX}/get-emails`,
  );
  return data;
};

export const fetchTimesheetEmailsApi = async (): Promise<EmailMessage[]> => {
  const { data } = await servicesApi.get<EmailMessage[]>(
    `${EMAIL_PREFIX}/get-emails`,
    { params: { classification: 'timesheet' } },
  );
  return data;
};

export const processAllEmailsApi = async (): Promise<unknown> => {
  const { data } = await servicesApi.post(
    `${EMAIL_PROCESSING_PREFIX}/process-all`,
  );
  return data;
};

export const reprocessFailedEmailsApi = async (): Promise<unknown> => {
  const { data } = await servicesApi.post(
    `${EMAIL_PROCESSING_PREFIX}/reprocess-failed`,
  );
  return data;
};

