/* ──────────────────────────────────────────────
 *  ProtectedRoute – guards authenticated routes
 *  Attempts session restoration on mount via initAuthThunk
 * ────────────────────────────────────────────── */
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { initAuthThunk } from '../../features/auth/authSlice';

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [initializing, setInitializing] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(initAuthThunk()).finally(() => setInitializing(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (initializing) {
    return (
      <div className="dashboard-loading">
        <span
          className="btn__spinner"
          style={{
            width: 24,
            height: 24,
            borderColor: 'rgba(0,82,204,0.2)',
            borderTopColor: '#0052cc',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
