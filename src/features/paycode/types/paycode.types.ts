/*
 *  Paycode / payroll domain types – mirrors backend schemas
 */

export interface Paycode {
    paycode_id: string;
    paycode: string;
    paycode_name: string;
}

export interface PaycodeState {
    paycodes: Paycode[];
    paycodesLoading: boolean;
    createPaycodeLoading: boolean;
    error: string | null;
}
