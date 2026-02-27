/* ──────────────────────────────────────────────
 *  Password-strength indicator (real-time rule checks)
 * ────────────────────────────────────────────── */
import { PASSWORD_RULES } from '../../utils/validation';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  if (!password) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const total = PASSWORD_RULES.length;
  const pct = (passed / total) * 100;

  const strengthLabel =
    pct <= 40 ? 'Weak' : pct <= 80 ? 'Medium' : 'Strong';

  const strengthColor =
    pct <= 40 ? 'var(--color-error)' : pct <= 80 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <div className="password-strength">
      <div className="password-strength__bar-bg">
        <div
          className="password-strength__bar-fill"
          style={{ width: `${pct}%`, backgroundColor: strengthColor }}
        />
      </div>
      <span className="password-strength__label" style={{ color: strengthColor }}>
        {strengthLabel}
      </span>
      <ul className="password-strength__rules">
        {PASSWORD_RULES.map((rule) => (
          <li
            key={rule.label}
            className={
              rule.test(password)
                ? 'password-strength__rule--pass'
                : 'password-strength__rule--fail'
            }
          >
            {rule.test(password) ? '✓' : '✗'} {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
