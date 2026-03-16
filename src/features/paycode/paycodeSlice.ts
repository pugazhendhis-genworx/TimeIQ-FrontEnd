/* ──────────────────────────────────────────────
 *  Paycode (payroll) feature – Redux slice
 * ────────────────────────────────────────────── */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    fetchPaycodesApi,
    createPaycodeApi,
} from './services/paycodeService';
import type { PaycodeState, Paycode } from './types/paycode.types';
import { extractErrorMessage } from '../../utils/errorHelpers';

const initialState: PaycodeState = {
    paycodes: [],
    paycodesLoading: false,
    createPaycodeLoading: false,
    error: null,
};

export const fetchPaycodesThunk = createAsyncThunk(
    'paycode/fetchPaycodes',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchPaycodesApi();
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

export const createPaycodeThunk = createAsyncThunk(
    'paycode/createPaycode',
    async (payload: Partial<Paycode>, { rejectWithValue }) => {
        try {
            return await createPaycodeApi(payload);
        } catch (err) {
            return rejectWithValue(extractErrorMessage(err));
        }
    },
);

const paycodeSlice = createSlice({
    name: 'paycode',
    initialState,
    reducers: {
        clearPaycodeError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaycodesThunk.pending, (state) => {
                state.paycodesLoading = true;
                state.error = null;
            })
            .addCase(fetchPaycodesThunk.fulfilled, (state, { payload }) => {
                state.paycodesLoading = false;
                state.paycodes = payload;
            })
            .addCase(fetchPaycodesThunk.rejected, (state, { payload }) => {
                state.paycodesLoading = false;
                state.error =
                    (payload as string) ?? 'Failed to fetch paycodes';
            });

        builder
            .addCase(createPaycodeThunk.pending, (state) => {
                state.createPaycodeLoading = true;
                state.error = null;
            })
            .addCase(createPaycodeThunk.fulfilled, (state, { payload }) => {
                state.createPaycodeLoading = false;
                state.paycodes.push(payload);
            })
            .addCase(createPaycodeThunk.rejected, (state, { payload }) => {
                state.createPaycodeLoading = false;
                state.error =
                    (payload as string) ?? 'Failed to create paycode';
            });
    },
});

export const { clearPaycodeError } = paycodeSlice.actions;
export default paycodeSlice.reducer;
