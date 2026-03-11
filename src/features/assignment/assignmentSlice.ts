/* ──────────────────────────────────────────────
 *  Assignment feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createAssignmentApi, fetchAssignmentsApi } from '../../services/assignmentService';
import type { AssignmentState } from '../../types/assignment.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: AssignmentState = {
    assignments: [],
    assignmentsLoading: false,
    error: null,
};

export const fetchAssignmentsThunk = createAsyncThunk(
    'assignment/fetchAssignments',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAssignmentsApi();
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

export const createAssignmentThunk = createAsyncThunk(
    'assignment/createAssignment',
    async (
        assignment: {
            employee_id: string;
            client_id: string;
            start_date: string;
            end_date: string;
            regular_rate: number;
            overtime_rate: number;
            double_time_rate: number;
        },
        { rejectWithValue },
    ) => {
        try {
            return await createAssignmentApi(assignment);
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

const assignmentSlice = createSlice({
    name: 'assignment',
    initialState,
    reducers: {
        clearAssignmentError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignmentsThunk.pending, (state) => {
                state.assignmentsLoading = true;
                state.error = null;
            })
            .addCase(fetchAssignmentsThunk.fulfilled, (state, { payload }) => {
                state.assignmentsLoading = false;
                state.assignments = payload;
            })
            .addCase(fetchAssignmentsThunk.rejected, (state, { payload }) => {
                state.assignmentsLoading = false;
                state.error =
                    (payload as string) ?? 'Failed to fetch assignments';
            })
            .addCase(createAssignmentThunk.fulfilled, (state, { payload }) => {
                state.assignments = [...state.assignments, payload];
            })
            .addCase(createAssignmentThunk.rejected, (state, { payload }) => {
                state.error =
                    (payload as string) ?? 'Failed to create assignment';
            });
    },
});

export const { clearAssignmentError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
