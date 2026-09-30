import { describe, expect, it } from 'vitest';
import { setAlarm, toggleAlarm } from './rules';
import { formatTimer, formatUntil, instantOn, nextOccurrence, notificationInstants, todaysAlarm } from './schedule';

// Wednesday 30 Sep 2026, 10:00 local time.
const WED_10AM = new Date(2026, 8, 30, 10, 0, 0).getTime();

describe('nextOccurrence', () => {
  it('finds a later alarm today', () => {
    const schedule = setAlarm({}, [3], 11 * 60);
    expect(nextOccurrence(schedule, WED_10AM)).toEqual({ at: new Date(2026, 8, 30, 11, 0).getTime(), day: 3, time: 660 });
  });

  it('skips alarms that already rang today and alarms that are off', () => {
    let schedule = setAlarm({}, [3], 7 * 60);
    schedule = setAlarm(schedule, [4], 8 * 60);
    schedule = toggleAlarm(schedule, 4);
    schedule = setAlarm(schedule, [5], 6 * 60);
    expect(nextOccurrence(schedule, WED_10AM)?.at).toBe(new Date(2026, 9, 2, 6, 0).getTime());
  });

  it('wraps to the same weekday next week', () => {
    const schedule = setAlarm({}, [3], 7 * 60);
    expect(nextOccurrence(schedule, WED_10AM)?.at).toBe(new Date(2026, 9, 7, 7, 0).getTime());
  });

  it('returns null with no alarms', () => {
    expect(nextOccurrence({}, WED_10AM)).toBeNull();
  });
});

describe('todaysAlarm', () => {
  it("returns today's alarm even after it rang", () => {
    const schedule = setAlarm({}, [3], 7 * 60);
    expect(todaysAlarm(schedule, WED_10AM)?.at).toBe(instantOn(WED_10AM, 420));
    expect(todaysAlarm(toggleAlarm(schedule, 3), WED_10AM)).toBeNull();
  });
});

describe('notifications', () => {
  it('go out 5 minutes and 1 minute before the alarm', () => {
    const at = new Date(2026, 9, 1, 7, 0).getTime();
    expect(notificationInstants(at)).toEqual([at - 300_000, at - 60_000]);
  });
});

describe('formatting', () => {
  it('formats countdowns', () => {
    expect(formatUntil(24_000)).toBe('24 s');
    expect(formatUntil(4 * 60_000 + 3_000)).toBe('4 m 03 s');
    expect(formatUntil(5 * 3_600_000 + 12 * 60_000)).toBe('5 h 12 m');
    expect(formatTimer(24_000)).toBe('0:24');
    expect(formatTimer(299_001)).toBe('5:00');
  });
});
