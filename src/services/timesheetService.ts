/* ──────────────────────────────────────────────
 *  Timesheet API service – HTTP calls (port 8001)
 * ────────────────────────────────────────────── */
import { servicesApi } from '../lib/axios';
import type {
  Timesheet,
  TimeEntryRaw,
  TimesheetStatus,
  ExtractedTimesheetDisplay,
} from '../types/timesheet.types';

const TIMESHEET_PREFIX = '/timesheet';
const APPROVAL_PREFIX = '/approval';

export const fetchTimesheetsApi = async (): Promise<Timesheet[]> => {
  const { data } = await servicesApi.get<Timesheet[]>(
    `${TIMESHEET_PREFIX}/get-timesheets`,
  );
  return data;
};

export const fetchTimesheetsByStatusApi = async (
  status: TimesheetStatus | string,
): Promise<Timesheet[]> => {
  const { data } = await servicesApi.get<Timesheet[]>(
    `${TIMESHEET_PREFIX}/status/${status}`,
  );
  return data;
};

export const fetchTimesheetsByClientApi = async (
  clientId: string,
): Promise<Timesheet[]> => {
  const { data } = await servicesApi.get<Timesheet[]>(
    `${TIMESHEET_PREFIX}/client/${clientId}`,
  );
  return data;
};

export const fetchTimesheetByIdApi = async (
  timesheetId: string,
): Promise<Timesheet> => {
  const { data } = await servicesApi.get<Timesheet>(
    `${TIMESHEET_PREFIX}/${timesheetId}`,
  );
  return data;
};

export const fetchTimesheetEntriesApi = async (
  timesheetId: string,
): Promise<TimeEntryRaw[]> => {
  const { data } = await servicesApi.get<TimeEntryRaw[]>(
    `${TIMESHEET_PREFIX}/${timesheetId}/entries`,
  );
  return data;
};

export const submitTimesheetForApprovalApi = async (
  timesheetId: string,
): Promise<Timesheet> => {
  const { data } = await servicesApi.post<Timesheet>(
    `${TIMESHEET_PREFIX}/${timesheetId}/submit-for-approval`,
  );
  return data;
};

// Placeholder for future PUT /timesheet/{id} once backend supports inline updates
export const updateTimesheetApi = async (
  timesheetId: string,
  payload: Partial<Timesheet>,
): Promise<Timesheet> => {
  const { data } = await servicesApi.put<Timesheet>(
    `${TIMESHEET_PREFIX}/${timesheetId}`,
    payload,
  );
  return data;
};

export const decideApprovalApi = async (
  timesheetId: string,
  payload: { decision: 'APPROVED' | 'REJECTED'; comment?: string },
): Promise<unknown> => {
  const { data } = await servicesApi.post(
    `${APPROVAL_PREFIX}/${timesheetId}/decide`,
    payload,
  );
  return data;
};

/** GET /timesheet/extracted-data/{id} — enriched display data with names & matching outcomes */
export const fetchExtractedTimesheetByIdApi = async (
  timesheetId: string,
): Promise<ExtractedTimesheetDisplay> => {
  const { data } = await servicesApi.get<ExtractedTimesheetDisplay>(
    `${TIMESHEET_PREFIX}/extracted-data/${timesheetId}`,
  );
  return data;
};

/** GET /timesheet/extracted-data/all — all extracted timesheets */
export const fetchAllExtractedTimesheetsApi = async (): Promise<ExtractedTimesheetDisplay[]> => {
  const { data } = await servicesApi.get<ExtractedTimesheetDisplay[]>(
    `${TIMESHEET_PREFIX}/extracted-data/all`,
  );
  return data;
};

