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
  AUTH_API_BASE_URL: import.meta.env.VITE_AUTH_BACKEND_URL,
  SERVICES_API_BASE_URL: import.meta.env.VITE_CORE_BACKEND_URL,
  APP_NAME: 'TimeGuard',
};

console.log("Auth URl", config.AUTH_API_BASE_URL)
console.log("Core url", config.SERVICES_API_BASE_URL)

export default config;
