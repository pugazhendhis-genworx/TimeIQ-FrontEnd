/* ──────────────────────────────────────────────
 *  ForgotPasswordPage – 3-step flow
 *  Step 1: Enter email → request OTP
 *  Step 2: Enter OTP
 *  Step 3: New password + confirm → verify & reset
 * ────────────────────────────────────────────── */
import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/common/InputField';
import PasswordStrength from '../../components/common/PasswordStrength';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { isEmailValid, isPasswordValid } from '../../utils/validation';
import {
  forgotPasswordRequestApi,
  forgotPasswordVerifyApi,
} from '../../services/authService';
import { extractErrorMessage } from '../../utils/errorHelpers';

type Step = 'email' | 'otp' | 'reset';

const OTP_LENGTH = 6;

/* ── SVG icons for each step ─────────────────── */
const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  /* shared */
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* step 1 */
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  /* step 2 */
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* step 3 */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [pwTouched, setPwTouched] = useState<Record<string, boolean>>({});

  const clearError = () => setError(null);

  /* ── Step 1: request OTP ────────────────────── */
  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearError();
      if (!email.trim()) { setEmailError('Email is required'); return; }
      if (!isEmailValid(email)) { setEmailError('Enter a valid email address'); return; }
      setEmailError('');
      setLoading(true);
      try {
        const res = await forgotPasswordRequestApi(email.trim());
        setSuccess(res.message ?? 'OTP sent to your email');
        setStep('otp');
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  /* ── Step 2: OTP input handling ─────────────── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const copy = [...otp];
    copy[index] = value.slice(-1);
    setOtp(copy);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const copy = [...otp];
    for (let i = 0; i < pasted.length; i++) copy[i] = pasted[i];
    setOtp(copy);
    const nextIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextIdx]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSuccess(null);
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Please enter the full ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setStep('reset');
  };

  const handleResendOtp = async () => {
    clearError();
    setSuccess(null);
    setLoading(true);
    try {
      const res = await forgotPasswordRequestApi(email.trim());
      setSuccess(res.message ?? 'OTP resent to your email');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: reset password ─────────────────── */
  const validatePasswords = useCallback(() => {
    const errs: typeof pwErrors = {};
    if (!newPassword) errs.newPassword = 'New password is required';
    else if (!isPasswordValid(newPassword)) errs.newPassword = 'Password does not meet all requirements';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }, [newPassword, confirmPassword]);

  const handleResetSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearError();
      setSuccess(null);
      const errs = validatePasswords();
      setPwErrors(errs);
      setPwTouched({ newPassword: true, confirmPassword: true });
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        const res = await forgotPasswordVerifyApi({
          email: email.trim(),
          otp: otp.join(''),
          new_password: newPassword,
        });
        setSuccess(res.message ?? 'Password reset successfully!');
        /* Redirect to login after short delay */
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [email, otp, newPassword, confirmPassword, validatePasswords, navigate],
  );

  /* ── Render ────────────────────────────────── */
  return (
    <div className="auth-form">
      {/* ── STEP 1: Email ──────────────────────── */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} noValidate>
          <div className="fp-step">
            <div className="fp-step__icon"><MailIcon /></div>
            <h2 className="fp-step__heading">Forgot Password?</h2>
            <p className="fp-step__desc">
              Enter the email associated with your account and we&apos;ll send you a verification code.
            </p>
          </div>

          {error && <Alert type="error" onClose={clearError}>{error}</Alert>}

          <InputField
            label="Email"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (!email.trim()) setEmailError('Email is required');
              else if (!isEmailValid(email)) setEmailError('Enter a valid email address');
              else setEmailError('');
            }}
            error={emailError || undefined}
            autoComplete="email"
          />

          <Button type="submit" fullWidth loading={loading}>
            Send Verification Code
          </Button>

          <p className="auth-form__footer">
            Remember your password?{' '}
            <Link to="/login" className="auth-form__link">Log in</Link>
          </p>
        </form>
      )}

      {/* ── STEP 2: OTP ────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} noValidate>
          <div className="fp-step">
            <div className="fp-step__icon"><ShieldIcon /></div>
            <h2 className="fp-step__heading">Verify OTP</h2>
            <p className="fp-step__desc">
              We&apos;ve sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>.
            </p>
          </div>

          {error && <Alert type="error" onClose={clearError}>{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div className="fp-otp-inputs" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <p className="fp-resend">
            Didn&apos;t receive the code?{' '}
            <button type="button" onClick={handleResendOtp} disabled={loading}>
              Resend
            </button>
          </p>

          <Button type="submit" fullWidth loading={loading}>
            Verify Code
          </Button>

          <p className="auth-form__footer">
            <button
              type="button"
              className="auth-form__link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              onClick={() => { setStep('email'); clearError(); setSuccess(null); }}
            >
              ← Change email
            </button>
          </p>
        </form>
      )}

      {/* ── STEP 3: Reset Password ────────────── */}
      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} noValidate>
          <div className="fp-step">
            <div className="fp-step__icon"><LockIcon /></div>
            <h2 className="fp-step__heading">Set New Password</h2>
            <p className="fp-step__desc">
              Create a strong new password for your account.
            </p>
          </div>

          {error && <Alert type="error" onClose={clearError}>{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <InputField
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => setPwTouched((p) => ({ ...p, newPassword: true }))}
            error={pwTouched.newPassword ? pwErrors.newPassword : undefined}
            autoComplete="new-password"
          />

          <PasswordStrength password={newPassword} />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setPwTouched((p) => ({ ...p, confirmPassword: true }))}
            error={pwTouched.confirmPassword ? pwErrors.confirmPassword : undefined}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading}>
            Reset Password
          </Button>

          <p className="auth-form__footer">
            <Link to="/login" className="auth-form__link">← Back to Login</Link>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
