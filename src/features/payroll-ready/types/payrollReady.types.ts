import type { RuleViolationItem } from '../../rule-violations/types/ruleViolation.types';

export interface PayrollReadyEntry {
  payroll_entry_id: string;
  export_id: string | null;
  timesheet_id: string;
  client_id: string;
  employee_id: string;
  week_ending: string | null;
  regular_hours: number;
  overtime_hours: number;
  double_time_hours: number;
  regular_rate: number;
  overtime_rate: number;
  double_time_rate: number;
  reg_pay: number;
  ot_pay: number;
  holiday_pay: number;
}

export interface PayrollTimesheetSummary {
  timesheet_id: string;
  payroll_entries: PayrollReadyEntry[];
  violations: RuleViolationItem[];
}
