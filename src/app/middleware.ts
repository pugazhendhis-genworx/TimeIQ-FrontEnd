/* ──────────────────────────────────────────────
 *  Custom middleware placeholder
 * ────────────────────────────────────────────── */
import type { Middleware } from '@reduxjs/toolkit';

/**
 * Example: logs every dispatched action in dev mode.
 * Replace / extend with real middleware as the app grows.
 */
export const loggerMiddleware: Middleware = (_store) => (next) => (action) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[Redux]', action);
  }
  return next(action);
};
