/* ──────────────────────────────────────────────
 *  Employee API service – HTTP calls (port 8001)
 * ────────────────────────────────────────────── */
import { servicesApi } from '../../../lib/axios';
import type {
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from '../types/employee.types';

const EMPLOYEE_PREFIX = '/employee';

export const fetchEmployeesApi = async (): Promise<Employee[]> => {
  const { data } = await servicesApi.get<Employee[]>(
    `${EMPLOYEE_PREFIX}/get-employees-with-assign-status`,
  );
  return data;
};

export const createEmployeeApi = async (
  payload: CreateEmployeePayload,
): Promise<Employee> => {
  const { data } = await servicesApi.post<Employee>(
    `${EMPLOYEE_PREFIX}/add-employee`,
    payload,
  );
  return data;
};

export const updateEmployeeApi = async (
  employeeId: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> => {
  const { data } = await servicesApi.put<Employee>(
    `${EMPLOYEE_PREFIX}/${employeeId}`,
    payload,
  );
  return data;
};

export const deleteEmployeeApi = async (
  employeeId: string,
): Promise<Employee> => {
  const { data } = await servicesApi.delete<Employee>(
    `${EMPLOYEE_PREFIX}/${employeeId}`,
  );
  return data;
};

