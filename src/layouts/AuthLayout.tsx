/* ──────────────────────────────────────────────
 *  AuthLayout – shared layout for login / signup pages
 *  Split-screen: brand panel (left) + form panel (right)
 * ────────────────────────────────────────────── */
import { Outlet } from 'react-router-dom';
import Logo from '../components/ui/Logo';

const AuthLayout = () => (
  <div className="auth-layout">
    {/* ── Brand side ───────────────────────────── */}
    <aside className="auth-layout__brand">
      <Logo size="lg" />
      <h1 className="auth-layout__tagline">
        Smart Timesheet<br />Processing, Simplified.
      </h1>
      <p className="auth-layout__desc">
        TimeIQ transforms how staffing companies process employee timesheets —
        leveraging AI to reduce manual processing by 70-80%, minimise errors,
        and scale without proportional headcount growth.
      </p>
    </aside>

    {/* ── Form side ────────────────────────────── */}
    <main className="auth-layout__content">
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
