/* ──────────────────────────────────────────────
 *  Pre-configured Axios instances
 *
 *  api          → auth / users / roles  (AUTH_API_BASE_URL – port 8000)
 *  servicesApi  → all other services    (SERVICES_API_BASE_URL – port 8001)
 *
 *  • withCredentials ensures the browser stores and sends
 *    httpOnly cookies (refresh_token) set by the server.
 *  • A 401 interceptor silently attempts a token refresh
 *    before surfacing the error to the caller.
 * ────────────────────────────────────────────── */
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import config from '../config/apiConfig';

/* ── Auth / Users / Roles instance (port 8000) ── */
const api = axios.create({
  baseURL: config.AUTH_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15_000,
});

/* ── Business-services instance (port 8001) ── */
const servicesApi = axios.create({
  baseURL: config.SERVICES_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15_000,
});

/* ── Shared 401 interceptor factory ─────────── */
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

/**
 * Attach a 401-interceptor that silently refreshes the access token
 * via the httpOnly cookie held by the auth service.
 */
const attach401Interceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      const url = originalRequest.url ?? '';
      if (url.includes('/auth/login') || url.includes('/auth/signup')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        /* Refresh always goes through the auth service (port 8000) */
        const { data } = await api.post<{ access_token: string }>('/auth/refresh');

        /* Update both instances so future requests carry the new token */
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        servicesApi.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        processQueue(null, data.access_token);
        return instance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);

        delete api.defaults.headers.common.Authorization;
        delete servicesApi.defaults.headers.common.Authorization;
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

/* Attach the interceptor to both instances */
attach401Interceptor(api);
attach401Interceptor(servicesApi);

export { servicesApi };
export default api;
