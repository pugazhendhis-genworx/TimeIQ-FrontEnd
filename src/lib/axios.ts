/* ──────────────────────────────────────────────
 *  Pre-configured Axios instance
 *
 *  • withCredentials ensures the browser stores and sends
 *    httpOnly cookies (refresh_token) set by the server.
 *  • A 401 interceptor silently attempts a token refresh
 *    before surfacing the error to the caller.
 * ────────────────────────────────────────────── */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import config from '../config/apiConfig';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send / receive httpOnly cookies
  timeout: 15_000,
});

/* ── 401 interceptor: silent refresh via httpOnly cookie ── */
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    /* Only attempt refresh on 401 and not already retried */
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    /* Skip refresh for the login & signup endpoints themselves */
    const url = originalRequest.url ?? '';
    if (url.includes('/auth/login') || url.includes('/auth/signup')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      /* Queue subsequent 401s while a refresh is in flight */
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /*
       * The refresh endpoint reads the refresh_token from the
       * httpOnly cookie — no token is sent in the request body.
       */
      const { data } = await api.post<{ access_token: string }>('/auth/refresh');

      /* Update the default Authorization header for future calls */
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

      processQueue(null, data.access_token);
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr as AxiosError, null);

      /* Refresh failed → clear auth state and redirect to login */
      delete api.defaults.headers.common.Authorization;
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
