/*
 *  Extracted data API service – HTTP calls (port 8001)
 */
import { servicesApi } from '../../../lib/axios';
import type { ExtractedTimesheetData } from '../types/extracted.types';

const TIMESHEET_PREFIX = '/timesheet';

export const fetchExtractedTimesheetsApi = async (): Promise<ExtractedTimesheetData[]> => {
    const { data } = await servicesApi.get<ExtractedTimesheetData[]>(
        `${TIMESHEET_PREFIX}/extracted-data/all`,
    );
    return data;
};

export const fetchExtractedTimesheetByIdApi = async (
    timesheetId: string,
): Promise<ExtractedTimesheetData> => {
    const { data } = await servicesApi.get<ExtractedTimesheetData>(
        `${TIMESHEET_PREFIX}/extracted-data/${timesheetId}`,
    );
    return data;
};

export const approveTimesheetApi = async (
    timesheetId: string,
    comment?: string,
): Promise<ExtractedTimesheetData> => {
    const { data } = await servicesApi.post<ExtractedTimesheetData>(
        `${TIMESHEET_PREFIX}/approval/${timesheetId}/decide`,
        { decision: 'APPROVED', comment },
    );
    return data;
};

export const rejectTimesheetApi = async (
    timesheetId: string,
    comment?: string,
): Promise<ExtractedTimesheetData> => {
    const { data } = await servicesApi.post<ExtractedTimesheetData>(
        `${TIMESHEET_PREFIX}/approval/${timesheetId}/decide`,
        { decision: 'REJECTED', comment },
    );
    return data;
};

export const fetchPayrollExportApi = async (): Promise<any[]> => {
    const { data } = await servicesApi.get<any[]>(
        `${TIMESHEET_PREFIX}/payroll/export`,
    );
    return data;
};
