export interface Holiday {
  id: string;
  client_id: string;
  holiday_date: string;
  name: string;
  type: string;
}

export interface HolidayCreatePayload {
  client_id: string;
  holiday_date: string;
  name: string;
  type?: string;
}
