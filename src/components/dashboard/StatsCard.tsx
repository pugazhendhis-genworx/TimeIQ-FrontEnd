/* ──────────────────────────────────────────────
 *  Dashboard statistics card
 * ────────────────────────────────────────────── */

interface StatsCardProps {
  label: string;
  value: string | number;
}

const StatsCard = ({ label, value }: StatsCardProps) => (
  <div className="stat-card">
    <div className="stat-card__label">{label}</div>
    <div className="stat-card__value">{value}</div>
  </div>
);

export default StatsCard;
