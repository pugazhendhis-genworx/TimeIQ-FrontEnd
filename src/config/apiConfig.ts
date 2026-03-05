/* ──────────────────────────────────────────────
 *  Centralised environment / API configuration
 * ────────────────────────────────────────────── */

interface AppConfig {
  /**
   * In development Vite proxies `/api` → `http://127.0.0.1:8000` so that
   * httpOnly cookies are set on the same origin and sent back automatically.
   * In production this should point to the real backend URL.
   */
  API_BASE_URL: string;
  APP_NAME: string;
}

const config: AppConfig = {
  API_BASE_URL: 'http://localhost:8000',
  APP_NAME: 'TimeGuard',
};

export default config;
