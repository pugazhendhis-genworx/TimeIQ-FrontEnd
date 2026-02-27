/* ──────────────────────────────────────────────
 *  Password & form-field validation helpers
 * ────────────────────────────────────────────── */

export interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter (a-z)', test: (v) => /[a-z]/.test(v) },
  { label: 'One digit (0-9)', test: (v) => /\d/.test(v) },
  { label: 'One special character (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const isPasswordValid = (password: string): boolean =>
  PASSWORD_RULES.every((r) => r.test(password));

export const isEmailValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneValid = (phone: string): boolean =>
  /^\+?[\d\s-]{7,15}$/.test(phone);
