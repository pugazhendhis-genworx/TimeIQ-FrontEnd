/* ──────────────────────────────────────────────
 *  SignupForm – presentational form component
 * ────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../../../components/common/InputField';
import PasswordStrength from '../../../components/common/PasswordStrength';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { isEmailValid, isPasswordValid, isPhoneValid } from '../../../utils/validation';

interface SignupFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (data: {
    name: string;
    email: string;
    contact_no: string;
    password: string;
  }) => void;
  onClearError: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  contact_no?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupForm = ({ loading, error, onSubmit, onClearError }: SignupFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = useCallback(
    (field: string) => setTouched((prev) => ({ ...prev, [field]: true })),
    [],
  );

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!isEmailValid(email)) errs.email = 'Enter a valid email address';
    if (!contactNo.trim()) errs.contact_no = 'Contact number is required';
    else if (!isPhoneValid(contactNo)) errs.contact_no = 'Enter a valid phone number';
    if (!password) errs.password = 'Password is required';
    else if (!isPasswordValid(password)) errs.password = 'Password does not meet all requirements';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }, [name, email, contactNo, password, confirmPassword]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClearError();
    const errs = validate();
    setFormErrors(errs);
    // mark all touched
    setTouched({ name: true, email: true, contact_no: true, password: true, confirmPassword: true });
    if (Object.keys(errs).length > 0) return;
    onSubmit({ name: name.trim(), email: email.trim(), contact_no: contactNo.trim(), password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form__title">Create your account</h2>
      <p className="auth-form__subtitle">
        Get started with AI-powered timesheet processing
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
        label="Full Name"
        type="text"
        placeholder="John Doe"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => markTouched('name')}
        error={touched.name ? formErrors.name : undefined}
        autoComplete="name"
      />

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
        label="Contact Number"
        type="tel"
        placeholder="+1 234 567 8900"
        required
        value={contactNo}
        onChange={(e) => setContactNo(e.target.value)}
        onBlur={() => markTouched('contact_no')}
        error={touched.contact_no ? formErrors.contact_no : undefined}
        autoComplete="tel"
      />

      <InputField
        label="Create Password"
        type="password"
        placeholder="Min 8 characters"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => markTouched('password')}
        error={touched.password ? formErrors.password : undefined}
        autoComplete="new-password"
      />

      <PasswordStrength password={password} />

      <InputField
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={() => markTouched('confirmPassword')}
        error={touched.confirmPassword ? formErrors.confirmPassword : undefined}
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth loading={loading}>
        Sign Up
      </Button>

      <p className="auth-form__footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-form__link">
          Log in
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
