/* ──────────────────────────────────────────────
 *  Reusable Alert / toast-style banner
 * ────────────────────────────────────────────── */
import type { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  children: ReactNode;
  onClose?: () => void;
}

const iconMap: Record<AlertProps['type'], string> = {
  success: 'OK',
  error: 'Error',
  info: 'Info',
};

const Alert = ({ type, children, onClose }: AlertProps) => (
  <div className={`alert alert--${type}`} role="alert">
    <span className="alert__icon">{iconMap[type]}</span>
    <span className="alert__message">{children}</span>
    {onClose && (
      <button
        type="button"
        className="alert__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        ×
      </button>
    )}
  </div>
);

export default Alert;
