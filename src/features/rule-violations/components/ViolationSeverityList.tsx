import { useMemo } from 'react';
import Badge from '../../../components/common/Badge';
import type { RuleViolationItem } from '../types/ruleViolation.types';

const severityVariant = (sev: string): string => {
  const u = sev?.toUpperCase() ?? '';
  if (u.includes('CRITICAL') || u.includes('HIGH')) return 'inactive';
  if (u.includes('MEDIUM') || u.includes('WARN')) return 'assignment_violation';
  return 'info';
};

const ViolationSeverityList = ({ items }: { items: RuleViolationItem[] }) => {
  const bySev = useMemo(() => {
    const m = new Map<string, RuleViolationItem[]>();
    items.forEach((v) => {
      const k = v.severity || 'UNKNOWN';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(v);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  return (
    <div className="feature-stack">
      {bySev.map(([sev, list]) => (
        <div key={sev} className="insight-card insight-card--compact">
          <div className="insight-card__head">
            <Badge variant={severityVariant(sev)}>{sev}</Badge>
            <span className="text-muted text-sm">{list.length} issue(s)</span>
          </div>
          <ul className="violation-list">
            {list.map((v) => (
              <li key={v.violation_id}>
                <strong>{v.violation_type}</strong>
                {v.description && (
                  <p className="text-muted text-sm" style={{ marginTop: 4 }}>
                    {v.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ViolationSeverityList;
