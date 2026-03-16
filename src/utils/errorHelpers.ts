/* ──────────────────────────────────────────────
 *  Normalise API / Axios errors into user-friendly strings
 * ────────────────────────────────────────────── */
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../features/auth/types/auth.types';

export const extractErrorMessage = (error: unknown): string => {
  const axiosErr = error as AxiosError<ApiErrorResponse>;

  if (axiosErr.response?.data?.detail) {
    const detail = axiosErr.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join('. ');
  }

  if (axiosErr.message) return axiosErr.message;

  return 'An unexpected error occurred. Please try again.';
};
