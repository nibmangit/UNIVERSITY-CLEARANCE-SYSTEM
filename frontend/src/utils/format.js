
const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const DATE_TIME = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, fallback = '—') {
  const date = toDate(value);
  return date ? DATE.format(date) : fallback;
}

export function formatDateTime(value, fallback = '—') {
  const date = toDate(value);
  return date ? DATE_TIME.format(date) : fallback;
}

/** "just now", "5 minutes ago", "yesterday"; falls back to a date after a week. */
export function timeAgo(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return '—';

  const seconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 45) return 'just now';
  if (abs < 3600) return RELATIVE.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return RELATIVE.format(Math.round(seconds / 3600), 'hour');
  if (abs < 604800) return RELATIVE.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
}