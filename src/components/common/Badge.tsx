/* ──────────────────────────────────────────────
 *  Reusable Badge component
 * ────────────────────────────────────────────── */
import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  variant: string;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}

const Badge = ({ variant, children, style, onClick }: BadgeProps) => (
  <span
    className={`badge badge--${variant.toLowerCase().replace(/\s+/g, '_')}`}
    style={style}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
  >
    {children}
  </span>
);

export default Badge;
