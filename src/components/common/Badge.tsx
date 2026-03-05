/* ──────────────────────────────────────────────
 *  Reusable Badge component
 * ────────────────────────────────────────────── */
import type { ReactNode } from 'react';

interface BadgeProps {
  variant: string;
  children: ReactNode;
}

const Badge = ({ variant, children }: BadgeProps) => (
  <span className={`badge badge--${variant.toLowerCase().replace(/\s+/g, '_')}`}>
    {children}
  </span>
);

export default Badge;
