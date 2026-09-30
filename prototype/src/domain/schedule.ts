import { NOTIFY_BEFORE_MS, type ClockTime, type Weekday, type WeekSchedule } from './rules';

/** The instant `time` happens on the calendar day of `date`, in local time. */
export function instantOn(date: Date | number, time: ClockTime): number {
  const d = new Date(date);
  d.setHours(Math.floor(time / 60), time % 60, 0, 0);
  return d.getTime();
}

export interface Occurrence {
  at: number;
  day: Weekday;
  time: ClockTime;
}

/** The next enabled alarm strictly after `now`, looking up to one week ahead. */
export function nextOccurrence(schedule: WeekSchedule, now: number): Occurrence | null {
  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const day = date.getDay() as Weekday;
    const alarm = schedule[day];
    if (!alarm || !alarm.on) continue;
    const at = instantOn(date, alarm.time);
    if (at > now) return { at, day, time: alarm.time };
  }
  return null;
}

/** Today's enabled alarm, if any (even if it already rang). */
export function todaysAlarm(schedule: WeekSchedule, now: number): Occurrence | null {
  const day = new Date(now).getDay() as Weekday;
  const alarm = schedule[day];
  if (!alarm || !alarm.on) return null;
  return { at: instantOn(now, alarm.time), day, time: alarm.time };
}

/** When the two group notifications for an alarm go out (5 min and 1 min before). */
export function notificationInstants(at: number): number[] {
  return NOTIFY_BEFORE_MS.map((before) => at - before);
}

/** "in 5 h 12 m", "in 4 m 03 s", "in 24 s". */
export function formatUntil(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} m`;
  if (m > 0) return `${m} m ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}

/** "0:24", "4:59". */
export function formatTimer(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
