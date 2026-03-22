import type { AuditLog } from '../features/audit/types/audit.types';

const SENSITIVE_KEYS = new Set([
  'user_id',
  'userId',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
]);

/**
 * Human-readable audit line without exposing raw metadata JSON or user identifiers.
 */
export function formatAuditLogDescription(log: AuditLog): string {
  const meta = log.metadata_json;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    const direct =
      (typeof m.summary === 'string' && m.summary) ||
      (typeof m.message === 'string' && m.message) ||
      (typeof m.description === 'string' && m.description);
    if (direct && direct.length <= 500) return direct;
  }

  const parts: string[] = [
    `${log.action} on ${log.entity_type.replace(/_/g, ' ').toLowerCase()}`,
  ];

  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    const prefer = [
      'status',
      'from',
      'to',
      'comment',
      'reason',
      'client_name',
      'timesheet_status',
      'decision',
    ];
    for (const key of prefer) {
      if (SENSITIVE_KEYS.has(key)) continue;
      const v = m[key];
      if (v == null) continue;
      const s = typeof v === 'object' ? '' : String(v);
      if (!s || s.length > 160) continue;
      parts.push(`${key.replace(/_/g, ' ')}: ${s}`);
    }
  }

  return parts.join(' · ');
}
