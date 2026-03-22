import { servicesApi } from '../../../lib/axios';
import type { PayrollReadyEntry, PayrollTimesheetSummary } from '../types/payrollReady.types';

const PREFIX = '/payroll_ready';

export const fetchAllPayrollReadyApi = async (): Promise<PayrollReadyEntry[]> => {
  const { data } = await servicesApi.get<{ data: PayrollReadyEntry[] }>(`${PREFIX}/`);
  return data.data;
};

export const fetchPayrollSummaryByTimesheetApi = async (
  timesheetId: string,
): Promise<PayrollTimesheetSummary> => {
  const { data } = await servicesApi.get<PayrollTimesheetSummary>(
    `${PREFIX}/timesheet/${timesheetId}`,
  );
  return data;
};

export const fetchPayrollEntryByIdApi = async (
  payrollEntryId: string,
): Promise<PayrollReadyEntry> => {
  const { data } = await servicesApi.get<{ data: PayrollReadyEntry }>(
    `${PREFIX}/${payrollEntryId}`,
  );
  return data.data;
};
