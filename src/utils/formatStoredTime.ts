/* ──────────────────────────────────────────────
 *  Format ISO date strings as stored in the DB
 *  WITHOUT converting to the browser's local timezone.
 *
 *  The backend stores DateTime(timezone=True) in Postgres,
 *  serialised as ISO-8601 strings (e.g. "2026-03-25T10:30:00+00:00").
 *  These helpers display the exact date/time from the string
 *  so what the user sees matches what the database holds.
 * ────────────────────────────────────────────── */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Parse the date/time components directly from an ISO-8601 string
 * without timezone conversion.
 *
 * Handles formats like:
 *   "2026-03-25T10:30:00"
 *   "2026-03-25T10:30:00+00:00"
 *   "2026-03-25T10:30:00Z"
 *   "2026-03-25"              (date-only)
 */
function parseISOParts(iso: string) {
  // Split on 'T' to separate date and optional time
  const [datePart, timePart] = iso.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  let hours = 0;
  let minutes = 0;
  if (timePart) {
    // Strip timezone suffix (+HH:MM, -HH:MM, or Z) and fractional seconds
    const clean = timePart.replace(/([Zz]|[+\-]\d{2}:\d{2})$/, '');
    const [h, m] = clean.split(':').map(Number);
    hours = h;
    minutes = m;
  }

  return { year, month, day, hours, minutes, hasTime: !!timePart };
}

/**
 * Format a stored ISO date/time string for display.
 * Returns e.g. "Mar 25, 2026 10:30 AM"
 * Returns '—' for null / undefined / empty.
 */
export const fmtStored = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    const { year, month, day, hours, minutes, hasTime } = parseISOParts(iso);
    const monthName = MONTHS[month - 1] ?? '';
    if (!hasTime) return `${monthName} ${day}, ${year}`;

    const h12 = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const mm = String(minutes).padStart(2, '0');
    return `${monthName} ${day}, ${year} ${h12}:${mm} ${ampm}`;
  } catch {
    return iso; // Fallback: show raw string
  }
};

/**
 * Format a stored ISO date string for date-only display.
 * Returns e.g. "Mar 25, 2026"
 * Returns '—' for null / undefined / empty.
 */
export const fmtStoredDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    const { year, month, day } = parseISOParts(iso);
    const monthName = MONTHS[month - 1] ?? '';
    return `${monthName} ${day}, ${year}`;
  } catch {
    return iso;
  }
};
