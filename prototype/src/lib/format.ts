import { WEEKDAY_SHORT, formatClockTime, fromClockTime, type Weekday, type WeekSchedule } from '../domain/rules';
import { nextOccurrence } from '../domain/schedule';

export function describeDays(days: readonly Weekday[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  const key = sorted.join('');
  if (key === '') return 'No days selected';
  if (key === '0123456') return 'Every day';
  if (key === '12345') return 'Weekdays';
  if (key === '06') return 'Weekends';
  return sorted.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

/** "Today", "Tomorrow" or a short weekday name. */
export function relativeDay(at: number, now: number): string {
  const startOf = (ms: number) => {
    const d = new Date(ms);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const diff = Math.round((startOf(at) - startOf(now)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return WEEKDAY_SHORT[new Date(at).getDay()];
}

export function nextAlarmLabel(schedule: WeekSchedule, now: number): string {
  const next = nextOccurrence(schedule, now);
  return next ? `${relativeDay(next.at, now)} ${formatClockTime(next.time)}` : 'No alarms set';
}

/** Split an instant into "7:05" and "AM". */
export function clockParts(ms: number): { hm: string; meridiem: string } {
  const d = new Date(ms);
  const { hour12, minute, meridiem } = fromClockTime(d.getHours() * 60 + d.getMinutes());
  return { hm: `${hour12}:${String(minute).padStart(2, '0')}`, meridiem };
}

export function clockWithSeconds(ms: number): string {
  const d = new Date(ms);
  const { hour12, meridiem } = fromClockTime(d.getHours() * 60 + d.getMinutes());
  return `${hour12}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} ${meridiem}`;
}

export function longDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function greeting(now: number): string {
  const h = new Date(now).getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "You", "You and Jon", "You, Jon and Mei Ling". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
