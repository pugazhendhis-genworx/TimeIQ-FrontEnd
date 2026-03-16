/* ──────────────────────────────────────────────
 *  SignupPage – feature page (container)
 * ────────────────────────────────────────────── */
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { signupThunk, clearAuthError, resetSignupSuccess } from './authSlice';
import SignupForm from './components/SignupForm';
import Alert from '../../components/common/Alert';

const SignupPage = () => {
  const dispatch = useAppDispatch();
  const { loading, error, signupSuccess } = useAppSelector((s) => s.auth);

  const handleSubmit = (data: {
    name: string;
    email: string;
    contact_no: string;
    password: string;
  }) => {
    dispatch(signupThunk(data));
  };

  if (signupSuccess) {
    return (
      <div className="auth-success">
        <Alert type="success" onClose={() => dispatch(resetSignupSuccess())}>
          Account created successfully!
        </Alert>
        <p className="auth-success__text">
          Your account has been created. Please log in to continue.
        </p>
        <Link to="/login" className="btn btn--primary btn--full auth-success__cta">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <SignupForm
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onClearError={() => dispatch(clearAuthError())}
    />
  );
};

export default SignupPage;
