/*
 *  Assignment domain types – mirrors backend schemas
 */

export interface Assignment {
    assignment_id: string;
    employee_id: string;
    client_id: string;
    start_date: string;
    end_date: string;
    regular_rate: string;
    overtime_rate: string;
    double_time_rate: string;
    paycode_id: string | null;
    is_active: boolean;
}

export interface AssignmentState {
    assignments: Assignment[];
    assignmentsLoading: boolean;
    error: string | null;
}
