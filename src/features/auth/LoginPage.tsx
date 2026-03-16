/* ──────────────────────────────────────────────
 *  LoginPage – feature page (container)
 * ────────────────────────────────────────────── */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { loginThunk, clearAuthError } from './authSlice';
import LoginForm from './components/LoginForm';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (data: { username: string; password: string }) => {
    dispatch(loginThunk(data));
  };

  return (
    <LoginForm
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onClearError={() => dispatch(clearAuthError())}
    />
  );
};

export default LoginPage;
