/*
 *  Extracted data display types
 */

export interface ExtractedTimeEntry {
    timeentry_id: string;
    employee_id: string | null;
    employee_name: string | null;
    client_id: string;
    client_name: string;
    start_time: string | null;
    end_time: string | null;
    regular_hours: number;
    overtime_hours: number;
    double_time_hours: number;
    paycode_id: string | null;
    paycode_code: string | null;
}

export interface ExtractedTimesheetData {
    timesheet_id: string;
    email_message_id: string;
    sender_email: string;
    received_at: string;
    client_id: string;
    client_name: string;
    week_ending: string | null;
    status: string;
    extraction_status: string | null;
    extraction_confidence: number | null;
    entries: ExtractedTimeEntry[];
    updated_at: string | null;
}

export interface ExtractionState {
    extractedData: ExtractedTimesheetData[];
    loading: boolean;
    error: string | null;
}
