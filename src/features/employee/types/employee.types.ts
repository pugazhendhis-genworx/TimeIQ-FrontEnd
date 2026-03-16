/* ──────────────────────────────────────────────
 *  Employee domain types – mirrors backend schemas
 *  Backend: src/schemas/employee_schemas.py
 * ────────────────────────────────────────────── */

export interface Employee {
  employee_id: string;
  emp_email: string;
  first_name: string;
  last_name: string;
  dob: string;
  designation: string;
  is_active: boolean;
  created_at: string;
  assigned?: boolean;
}

export interface CreateEmployeePayload {
  emp_email: string;
  first_name: string;
  last_name: string;
  dob: string;
  designation: string;
}

export interface UpdateEmployeePayload {
  emp_email?: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  designation?: string;
  is_active?: boolean;
}

export interface EmployeeState {
  employees: Employee[];
  employeesLoading: boolean;
  createEmployeeLoading: boolean;
  updateEmployeeLoading: boolean;
  deleteEmployeeLoading: boolean;
  error: string | null;
}

