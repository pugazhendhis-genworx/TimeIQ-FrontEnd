/* ──────────────────────────────────────────────
 *  Logo / Brand component
 * ────────────────────────────────────────────── */
import config from '../../config/apiConfig';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<LogoProps['size']>, string> = {
  sm: '1.25rem',
  md: '1.75rem',
  lg: '2.5rem',
};

const Logo = ({ size = 'md' }: LogoProps) => (
  <div className="logo" style={{ fontSize: sizeMap[size] }}>
    <svg className="logo__icon" width="1.3em" height="1.3em" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
    <span className="logo__text">{config.APP_NAME}</span>
  </div>
);

export default Logo;
