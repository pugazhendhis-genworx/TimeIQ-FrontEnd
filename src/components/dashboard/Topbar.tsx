/* ──────────────────────────────────────────────
 *  Dashboard top bar
 * ────────────────────────────────────────────── */
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logoutThunk } from '../../features/auth/authSlice';

const Topbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login', { replace: true });
  };

  const displayLabel = user
    ? `${(user.role ?? '').toUpperCase()} — ${user.user_id}`
    : '';

    



  return (
    <div className="topbar">
      <h2 className="topbar__brand">TimeGuard {user?.role}</h2>
      <div className="topbar__right">
        <span className="topbar__user-pill">{displayLabel}</span>
        <button className="topbar__logout" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
