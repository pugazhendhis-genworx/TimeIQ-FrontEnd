import { servicesApi } from '../../../lib/axios';
import type {
  FlaggedTimesheetSummary,
  RuleViolationDetail,
} from '../types/ruleViolation.types';

const PREFIX = '/rule_violations';

export const fetchFlaggedTimesheetsApi = async (): Promise<FlaggedTimesheetSummary[]> => {
  const { data } = await servicesApi.get<{ data: FlaggedTimesheetSummary[] }>(
    `${PREFIX}/`,
  );
  return data.data;
};

export const fetchViolationDetailApi = async (
  timesheetId: string,
): Promise<RuleViolationDetail> => {
  const { data } = await servicesApi.get<RuleViolationDetail>(
    `${PREFIX}/timesheet/${timesheetId}`,
  );
  return data;
};
