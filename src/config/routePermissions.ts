/* ──────────────────────────────────────────────
 *  Route → Role permission map
 *
 *  Single source of truth for which roles can
 *  access each dashboard route. If a route is
 *  not listed here it is accessible to every
 *  authenticated user.
 * ────────────────────────────────────────────── */

export type AppRole = 'admin' | 'operation_executive' | 'auditor';

/**
 * Map of route paths to the roles permitted to access them.
 * Dynamic segments (e.g. :timesheetId) are handled by prefix
 * matching inside the `hasRouteAccess` helper.
 */
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/dashboard':                        ['admin', 'operation_executive', 'auditor'],
  '/dashboard/users':                  ['admin'],
  '/dashboard/roles':                  ['admin'],
  '/dashboard/clients':                ['operation_executive'],
  '/dashboard/whitelist':              ['operation_executive'],
  '/dashboard/employees':              ['operation_executive'],
  '/dashboard/emails':                 ['operation_executive'],
  '/dashboard/timesheets':             ['operation_executive'],
  '/dashboard/holidays':               ['operation_executive'],
  '/dashboard/extracted-timesheets':   ['auditor'],
  '/dashboard/assignments':            ['operation_executive'],
  '/dashboard/payroll':                ['operation_executive'],
  '/dashboard/client-rules':           ['operation_executive'],
  '/dashboard/rule-violations':        ['operation_executive', 'auditor'],
  '/dashboard/payroll-ready':          ['auditor'],
  '/dashboard/audit':                  ['auditor'],
  '/dashboard/audit-timesheets':       ['auditor'],
  '/dashboard/audit-logs':             ['auditor'],
  '/dashboard/profile':                ['admin', 'operation_executive', 'auditor'],
};

/**
 * Check whether a given role is allowed to access `pathname`.
 *
 * 1. Exact match against ROUTE_PERMISSIONS.
 * 2. If no exact match, walk up path segments to find a prefix
 *    match (handles dynamic segments like :timesheetId).
 * 3. If no entry is found at all → allow (route is open to all
 *    authenticated users).
 */
export function hasRouteAccess(pathname: string, role: string): boolean {
  /* 1 — exact match */
  const exact = ROUTE_PERMISSIONS[pathname];
  if (exact) return exact.includes(role as AppRole);

  /* 2 — prefix walk (e.g. /dashboard/extracted-timesheets/abc123) */
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const prefix = '/' + segments.join('/');
    const entry = ROUTE_PERMISSIONS[prefix];
    if (entry) return entry.includes(role as AppRole);
  }

  /* 3 — no entry → open to all authenticated users */
  return true;
}
