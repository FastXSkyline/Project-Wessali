import type { Locale } from '@wessali/i18n';
import type { Booking } from './types';

const FALLBACK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatShortDate(value: string | null | undefined, locale: Locale) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
  } catch {
    return date.toDateString().slice(4, 10);
  }
}

export function lastSevenDays(locale: Locale) {
  const days: Array<{ date: Date; label: string; key: string }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    let label = FALLBACK_DAYS[date.getDay()];
    try {
      label = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    } catch {
      // Hermes builds without full Intl still get a readable fallback.
    }
    days.push({
      date,
      label,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    });
  }
  return days;
}

export function weeklyRequestCounts(bookings: Booking[], locale: Locale) {
  const days = lastSevenDays(locale);
  const counts = days.map(() => 0);
  for (const booking of bookings) {
    if (!booking.created_at) continue;
    const created = new Date(booking.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const key = `${created.getFullYear()}-${created.getMonth()}-${created.getDate()}`;
    const index = days.findIndex((day) => day.key === key);
    if (index >= 0) counts[index] += 1;
  }
  return counts;
}

export const activeStatuses = [
  'submitted',
  'matching',
  'offer_received',
  'accepted',
  'provider_en_route',
  'arrived',
  'in_progress',
];
export const closedStatuses = ['completed', 'cancelled', 'expired', 'disputed'];

export function isActive(status: string) {
  return activeStatuses.includes(status);
}

export function isClosed(status: string) {
  return closedStatuses.includes(status);
}

const progressByStatus: Record<string, number> = {
  submitted: 0.08,
  matching: 0.22,
  offer_received: 0.36,
  accepted: 0.52,
  provider_en_route: 0.66,
  arrived: 0.8,
  in_progress: 0.9,
  completed: 1,
};

export function statusProgress(status: string) {
  return progressByStatus[status] ?? 0.04;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
