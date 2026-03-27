/* ──────────────────────────────────────────────
 *  Centralised environment / API configuration
 * ────────────────────────────────────────────── */

interface AppConfig {
  /**
   * AUTH_API_BASE_URL  → auth, users, roles (port 8000)
   * SERVICES_API_BASE_URL → all other micro-services (port 8001)
   *
   * In development Vite proxies can be used so httpOnly cookies
   * stay on the same origin. In production point these to the
   * real backend URLs.
   */
  AUTH_API_BASE_URL: string;
  SERVICES_API_BASE_URL: string;
  APP_NAME: string;
}

const config: AppConfig = {
  AUTH_API_BASE_URL: 'https://timeguard-auth-backend-service-717740758627.us-east1.run.app',
  SERVICES_API_BASE_URL: 'https://timeguard-core-backend-service-717740758627.us-east1.run.app',
  APP_NAME: 'TimeGuard',
};

export default config;
