/* ──────────────────────────────────────────────
 *  LoginForm – presentational form component
 * ────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../common/InputField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { isEmailValid } from '../../utils/validation';

interface LoginFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (data: { username: string; password: string }) => void;
  onClearError: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginForm = ({ loading, error, onSubmit, onClearError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = useCallback(
    (field: string) => setTouched((prev) => ({ ...prev, [field]: true })),
    [],
  );

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!isEmailValid(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    return errs;
  }, [email, password]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClearError();
    const errs = validate();
    setFormErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length > 0) return;
    onSubmit({ username: email.trim(), password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form__title">Welcome back</h2>
      <p className="auth-form__subtitle">
        Log in to your Timesheet Processing Assistant
      </p>

      {error && (
        <Alert type="error" onClose={onClearError}>
          {error}
        </Alert>
      )}

      <p className="auth-form__required-hint">
        Fields marked with <span className="input-field__required">*</span> are required
      </p>

      <InputField
        label="Email"
        type="email"
        placeholder="john@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => markTouched('email')}
        error={touched.email ? formErrors.email : undefined}
        autoComplete="email"
      />

      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => markTouched('password')}
        error={touched.password ? formErrors.password : undefined}
        autoComplete="current-password"
      />

      <div className="auth-form__options">
        <Link to="/forgot-password" className="auth-form__link">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth loading={loading}>
        Log In
      </Button>

      <p className="auth-form__footer">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="auth-form__link">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
