/* ──────────────────────────────────────────────
 *  Timesheet domain types – mirrors backend schemas
 *  Backend: src/schemas/timesheet_schemas.py
 *           src/schemas/display_schemas.py
 * ────────────────────────────────────────────── */

export interface Timesheet {
  timesheet_id: string;
  email_message_id: string;
  client_id: string;
  week_ending: string | null;
  status: string;
  source: string | null;
  extraction_status: string | null;
  extraction_confidence: string | null;
  raw_extraction: Record<string, unknown> | null;
  updated_at: string | null;
}

export interface TimeEntryRaw {
  timeentry_id: string;
  timesheet_id: string;
  employee_id: string | null;
  client_id: string;
  start_time: string | null;
  end_time: string | null;
  regular_hours: string;
  overtime_hours: string;
  double_time_hours: string;
  paycode_id: string | null;
  matching_status?: string | null;
  employee_unmatched_reason?: string | null;
  client_unmatched_reason?: string | null;
  match_confidence?: string | null;
}

/** Enriched entry returned by GET /timesheet/extracted-data/{id} */
export interface TimeEntryDisplay {
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
  matching_status: string;
  employee_unmatched_reason: string | null;
  client_unmatched_reason: string | null;
  match_confidence: number | null;
}

/** Full extracted timesheet with denormalized context for the detail panel */
export interface ExtractedTimesheetDisplay {
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
  entries: TimeEntryDisplay[];
  updated_at: string | null;
}

export interface TimesheetFilters {
  status?: string | 'ALL';
  client_id?: string;
}

export interface TimesheetState {
  timesheets: Timesheet[];
  entriesByTimesheetId: Record<string, TimeEntryRaw[]>;
  extractedById: Record<string, ExtractedTimesheetDisplay>;
  selectedTimesheetId: string | null;
  timesheetsLoading: boolean;
  entriesLoading: boolean;
  extractedLoading: boolean;
  updateTimesheetLoading: boolean;
  submitForApprovalLoading: boolean;
  filters: TimesheetFilters;
  error: string | null;
}

