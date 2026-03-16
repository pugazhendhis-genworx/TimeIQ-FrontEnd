/*
 *  Paycode API service – HTTP calls (port 8001)
 */
import { servicesApi } from '../../../lib/axios';
import type { Paycode } from '../types/paycode.types';

const PAYCODE_PREFIX = '/paycode';

export const fetchPaycodesApi = async (): Promise<Paycode[]> => {
    const { data } = await servicesApi.get<Paycode[]>(
        `${PAYCODE_PREFIX}/get-paycodes`,
    );
    return data;
};

export const createPaycodeApi = async (
    payload: Partial<Paycode>,
): Promise<Paycode> => {
    const { data } = await servicesApi.post<Paycode>(
        `${PAYCODE_PREFIX}/add-paycode`,
        payload,
    );
    return data;
};
