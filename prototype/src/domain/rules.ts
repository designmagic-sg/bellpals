// Product rules for BellPals. Values marked "proposal" are not in the spec yet and are
// listed as open questions in docs/WHAT_I_NEED_FROM_YOU.md.

export const MAX_GROUP_MEMBERS = 5;
/** Friends' phones start ringing this long after the owner's first ring. */
export const GROUP_RING_DELAY_MS = 24_000;
/** Proposal: snooze length is not specified yet. */
export const SNOOZE_MS = 5 * 60_000;
/** Shorter snooze used by the prototype's "fast timings" switch. */
export const DEMO_SNOOZE_MS = 15_000;
/** Group notifications go out this long before an alarm. */
export const NOTIFY_BEFORE_MS = [5 * 60_000, 60_000] as const;

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 15;

export type Stage = 1 | 2 | 3;
export const STAGE_NAMES: Record<Stage, string> = { 1: 'Mini', 2: 'Super', 3: 'Mega' };

export function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(level)));
}

/** Levels 1–5, 6–10 and 11–15 are the three evolution stages. */
export function stageForLevel(level: number): Stage {
  const l = clampLevel(level);
  return l <= 5 ? 1 : l <= 10 ? 2 : 3;
}

/** Treats needed to turn an alarm off: 1 (Lv 1–5), 2 (Lv 6–10), 3 (Lv 11–15). */
export function treatsForLevel(level: number): Stage {
  return stageForLevel(level);
}

/** Proposal: fed mornings needed to go from `level` to `level + 1`. */
export function feedsToLevelUp(level: number): number {
  const l = clampLevel(level);
  if (l >= MAX_LEVEL) return Infinity;
  return l <= 5 ? 3 : l <= 10 ? 5 : 7;
}

export interface Growth {
  level: number;
  feeds: number;
}

export interface FeedResult extends Growth {
  leveledUp: boolean;
  evolved: boolean;
}

/** Apply one fed morning (an alarm turned off by feeding the BellPal). */
export function feedOnce(growth: Growth): FeedResult {
  const level = clampLevel(growth.level);
  if (level >= MAX_LEVEL) return { level, feeds: 0, leveledUp: false, evolved: false };
  const feeds = growth.feeds + 1;
  if (feeds < feedsToLevelUp(level)) return { level, feeds, leveledUp: false, evolved: false };
  const next = level + 1;
  return { level: next, feeds: 0, leveledUp: true, evolved: stageForLevel(next) !== stageForLevel(level) };
}

// ---- Days and times -------------------------------------------------------

/** 0 = Sunday … 6 = Saturday, matching Date#getDay(). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Minutes after local midnight, 0–1439. */
export type ClockTime = number;
export type Meridiem = 'AM' | 'PM';

export function toClockTime(hour12: number, minute: number, meridiem: Meridiem): ClockTime {
  return ((hour12 % 12) + (meridiem === 'PM' ? 12 : 0)) * 60 + minute;
}

export function fromClockTime(time: ClockTime): { hour12: number; minute: number; meridiem: Meridiem } {
  const hour = Math.floor(time / 60) % 24;
  return { hour12: hour % 12 === 0 ? 12 : hour % 12, minute: time % 60, meridiem: hour < 12 ? 'AM' : 'PM' };
}

export function formatClockTime(time: ClockTime): string {
  const { hour12, minute, meridiem } = fromClockTime(time);
  return `${hour12}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

// ---- Alarm schedule: one alarm per day --------------------------------------

export interface DayAlarm {
  time: ClockTime;
  on: boolean;
}

export type WeekSchedule = Partial<Record<Weekday, DayAlarm>>;

/** Setting a time on some days replaces whatever those days had, so each day keeps one alarm. */
export function setAlarm(schedule: WeekSchedule, days: readonly Weekday[], time: ClockTime): WeekSchedule {
  const next: WeekSchedule = { ...schedule };
  for (const day of days) next[day] = { time, on: true };
  return next;
}

export function removeAlarm(schedule: WeekSchedule, day: Weekday): WeekSchedule {
  const next: WeekSchedule = { ...schedule };
  delete next[day];
  return next;
}

export function toggleAlarm(schedule: WeekSchedule, day: Weekday): WeekSchedule {
  const current = schedule[day];
  if (!current) return schedule;
  return { ...schedule, [day]: { ...current, on: !current.on } };
}

/** Days (in the given order) whose existing alarm would be replaced by a new time. */
export function daysReplaced(schedule: WeekSchedule, days: readonly Weekday[], time: ClockTime): Weekday[] {
  return days.filter((d) => schedule[d] !== undefined && schedule[d]!.time !== time);
}
