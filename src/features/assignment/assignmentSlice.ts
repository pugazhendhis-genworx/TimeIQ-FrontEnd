/* ──────────────────────────────────────────────
 *  Assignment feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    createAssignmentApi,
    fetchAssignmentsApi,
    updateAssignmentApi,
    deleteAssignmentApi,
} from '../../services/assignmentService';
import type { AssignmentState, AssignmentUpdatePayload } from '../../types/assignment.types';
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

export const updateAssignmentThunk = createAsyncThunk(
    'assignment/updateAssignment',
    async (
        args: { assignmentId: string; payload: AssignmentUpdatePayload },
        { rejectWithValue },
    ) => {
        try {
            return await updateAssignmentApi(args.assignmentId, args.payload);
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

export const deleteAssignmentThunk = createAsyncThunk(
    'assignment/deleteAssignment',
    async (assignmentId: string, { rejectWithValue }) => {
        try {
            await deleteAssignmentApi(assignmentId);
            return assignmentId;
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
            })
            .addCase(updateAssignmentThunk.fulfilled, (state, { payload }) => {
                const idx = state.assignments.findIndex(
                    (a) => a.assignment_id === payload.assignment_id,
                );
                if (idx !== -1) state.assignments[idx] = payload;
            })
            .addCase(updateAssignmentThunk.rejected, (state, { payload }) => {
                state.error =
                    (payload as string) ?? 'Failed to update assignment';
            })
            .addCase(deleteAssignmentThunk.fulfilled, (state, { payload }) => {
                state.assignments = state.assignments.filter(
                    (a) => a.assignment_id !== payload,
                );
            })
            .addCase(deleteAssignmentThunk.rejected, (state, { payload }) => {
                state.error =
                    (payload as string) ?? 'Failed to delete assignment';
            });
    },
});

export const { clearAssignmentError } = assignmentSlice.actions;
export default assignmentSlice.reducer;

