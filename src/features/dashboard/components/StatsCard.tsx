/* ──────────────────────────────────────────────
 *  Dashboard statistics card
 * ────────────────────────────────────────────── */

interface StatsCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

const StatsCard = ({ label, value, hint }: StatsCardProps) => (
  <div className="stat-card">
    <div className="stat-card__label">{label}</div>
    <div className="stat-card__value">{value}</div>
    {hint && <div className="stat-card__hint">{hint}</div>}
  </div>
);

export default StatsCard;
