import type { Timesheet, TimeEntryRaw } from '../../timesheet/types/timesheet.types';

export interface RuleViolationItem {
  violation_id: string;
  timesheet_id: string;
  rule_id: string | null;
  violation_type: string;
  severity: string;
  description: string | null;
  created_at: string | null;
}

export interface FlaggedTimesheetSummary {
  timesheet_id: string;
  week_ending: string | null;
  status: string;
  email: string;
  source: string | null;
  latest_violation_created_at: string | null;
  email_received_at: string | null;
}

export interface RuleViolationDetail {
  status: string;
  timesheet: Timesheet;
  time_entries_raw: TimeEntryRaw[];
  violations: RuleViolationItem[];
}

export interface RuleViolationState {
  flaggedList: FlaggedTimesheetSummary[];
  flaggedListLoading: boolean;
  detailByTimesheetId: Record<string, RuleViolationDetail>;
  detailLoadingTimesheetId: string | null;
  error: string | null;
}
