/* ──────────────────────────────────────────────
 *  Employee feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchEmployeesApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
} from './services/employeeService';
import type {
  EmployeeState,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from './types/employee.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: EmployeeState = {
  employees: [],
  employeesLoading: false,
  createEmployeeLoading: false,
  updateEmployeeLoading: false,
  deleteEmployeeLoading: false,
  error: null,
};

export const fetchEmployeesThunk = createAsyncThunk(
  'employee/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchEmployeesApi();
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const createEmployeeThunk = createAsyncThunk(
  'employee/createEmployee',
  async (payload: CreateEmployeePayload, { rejectWithValue }) => {
    try {
      return await createEmployeeApi(payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const updateEmployeeThunk = createAsyncThunk(
  'employee/updateEmployee',
  async (
    args: { employeeId: string; payload: UpdateEmployeePayload },
    { rejectWithValue },
  ) => {
    try {
      const { employeeId, payload } = args;
      return await updateEmployeeApi(employeeId, payload);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

export const deleteEmployeeThunk = createAsyncThunk(
  'employee/deleteEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      return await deleteEmployeeApi(employeeId);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  },
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.employeesLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, { payload }) => {
        state.employeesLoading = false;
        state.employees = payload;
      })
      .addCase(fetchEmployeesThunk.rejected, (state, { payload }) => {
        state.employeesLoading = false;
        state.error =
          (payload as string) ?? 'Failed to fetch employees';
      });

    builder
      .addCase(createEmployeeThunk.pending, (state) => {
        state.createEmployeeLoading = true;
        state.error = null;
      })
      .addCase(createEmployeeThunk.fulfilled, (state, { payload }) => {
        state.createEmployeeLoading = false;
        state.employees.push(payload);
      })
      .addCase(createEmployeeThunk.rejected, (state, { payload }) => {
        state.createEmployeeLoading = false;
        state.error =
          (payload as string) ?? 'Failed to create employee';
      });

    builder
      .addCase(updateEmployeeThunk.pending, (state) => {
        state.updateEmployeeLoading = true;
        state.error = null;
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, { payload }) => {
        state.updateEmployeeLoading = false;
        const idx = state.employees.findIndex(
          (e) => e.employee_id === payload.employee_id,
        );
        if (idx !== -1) state.employees[idx] = payload;
      })
      .addCase(updateEmployeeThunk.rejected, (state, { payload }) => {
        state.updateEmployeeLoading = false;
        state.error =
          (payload as string) ?? 'Failed to update employee';
      });

    builder
      .addCase(deleteEmployeeThunk.pending, (state) => {
        state.deleteEmployeeLoading = true;
        state.error = null;
      })
      .addCase(deleteEmployeeThunk.fulfilled, (state, { payload }) => {
        state.deleteEmployeeLoading = false;
        state.employees = state.employees.filter(
          (e) => e.employee_id !== payload.employee_id,
        );
      })
      .addCase(deleteEmployeeThunk.rejected, (state, { payload }) => {
        state.deleteEmployeeLoading = false;
        state.error =
          (payload as string) ?? 'Failed to delete employee';
      });
  },
});

export const { clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;

