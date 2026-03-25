/*
 *  Assignment domain types – mirrors backend schemas
 */

export interface Assignment {
    assignment_id: string;
    employee_id: string;
    client_id: string;
    start_date: string;
    end_date: string;
    regular_rate: string | null;
    overtime_rate: string | null;
    double_time_rate: string | null;
    paycode_id: string | null;
    is_active: boolean;
}

export interface AssignmentUpdatePayload {
    start_date?: string;
    end_date?: string;
    regular_rate?: number;
    overtime_rate?: number;
    double_time_rate?: number;
    paycode_id?: string | null;
    is_active?: boolean;
}

export interface AssignmentState {
    assignments: Assignment[];
    assignmentsLoading: boolean;
    error: string | null;
}
