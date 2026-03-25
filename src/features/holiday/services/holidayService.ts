import { servicesApi } from '../../../lib/axios';
import type { Holiday, HolidayCreatePayload } from '../types/holiday.types';

const PREFIX = '/holiday';

export const fetchHolidaysByClientApi = async (
  clientId: string,
): Promise<Holiday[]> => {
  const { data } = await servicesApi.get<Holiday[]>(
    `${PREFIX}/client/${clientId}`,
  );
  return data;
};

export const createHolidayApi = async (
  payload: HolidayCreatePayload,
): Promise<Holiday> => {
  const { data } = await servicesApi.post<Holiday>(
    `${PREFIX}/create_holiday`,
    {
      ...payload,
      type: payload.type ?? 'Client Holiday',
    },
  );
  return data;
};

export const deleteHolidayApi = async (holidayId: string): Promise<void> => {
  await servicesApi.delete(`${PREFIX}/${holidayId}`);
};
