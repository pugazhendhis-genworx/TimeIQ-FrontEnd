/* ──────────────────────────────────────────────
 *  Reusable InputField component
 * ────────────────────────────────────────────── */
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

/* ── Inline SVG eye icons (no external dependency) ── */
const EyeOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  icon?: ReactNode;
}

const InputField = ({
  label,
  error,
  required,
  icon,
  type,
  id,
  ...rest
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-field">
      <label htmlFor={inputId} className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>

      <div className={`input-field__wrapper ${error ? 'input-field__wrapper--error' : ''}`}>
        {icon && <span className="input-field__icon">{icon}</span>}

        <input
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className="input-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className="input-field__toggle"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeClosed /> : <EyeOpen />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="input-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
