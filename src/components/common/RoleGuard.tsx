/* ──────────────────────────────────────────────
 *  RoleGuard – enforces role-based access on
 *  dashboard routes. Redirects to /login when
 *  the current user's role lacks permission.
 * ────────────────────────────────────────────── */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { hasRouteAccess } from '../../config/routePermissions';

const RoleGuard = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { pathname } = useLocation();

  const role = user?.role?.toLowerCase() ?? '';

  if (!hasRouteAccess(pathname, role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
