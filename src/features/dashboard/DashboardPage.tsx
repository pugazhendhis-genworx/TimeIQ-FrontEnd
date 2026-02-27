/* ──────────────────────────────────────────────
 *  DashboardPage – placeholder landing after login
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logoutThunk } from '../auth/authSlice';
import Button from '../../components/common/Button';
import Logo from '../../components/ui/Logo';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  /* Redirect to login after logout */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <Logo size="sm" />
        <Button variant="danger" onClick={handleLogout}>
          ⏻ Logout
        </Button>
      </header>

      <main className="dashboard__main">
        <h1>Welcome{user?.user_name ? `, ${user.user_name}` : ''}! 🎉</h1>
        <p>You have successfully logged in to TimeIQ — your Timesheet Processing Assistant.</p>
        <p className="dashboard__hint">
          Start processing timesheets, reviewing extractions, and managing approvals.
        </p>
      </main>
    </div>
  );
};

export default DashboardPage;
