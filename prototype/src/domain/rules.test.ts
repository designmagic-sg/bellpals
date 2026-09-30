import { describe, expect, it } from 'vitest';
import {
  daysReplaced,
  feedOnce,
  feedsToLevelUp,
  formatClockTime,
  fromClockTime,
  removeAlarm,
  setAlarm,
  stageForLevel,
  toClockTime,
  toggleAlarm,
  treatsForLevel,
  type WeekSchedule,
} from './rules';

describe('BellPal levels', () => {
  it('uses three evolution stages', () => {
    expect([1, 5, 6, 10, 11, 15].map(stageForLevel)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('needs 1, 2 or 3 treats depending on level', () => {
    expect(treatsForLevel(1)).toBe(1);
    expect(treatsForLevel(5)).toBe(1);
    expect(treatsForLevel(6)).toBe(2);
    expect(treatsForLevel(10)).toBe(2);
    expect(treatsForLevel(11)).toBe(3);
    expect(treatsForLevel(15)).toBe(3);
  });

  it('clamps out-of-range levels', () => {
    expect(stageForLevel(0)).toBe(1);
    expect(stageForLevel(99)).toBe(3);
  });

  it('levels up after enough fed mornings and flags evolutions', () => {
    let growth = { level: 5, feeds: 0 };
    for (let i = 1; i < feedsToLevelUp(5); i++) {
      growth = feedOnce(growth);
      expect(growth).toMatchObject({ level: 5, leveledUp: false });
    }
    const result = feedOnce(growth);
    expect(result).toEqual({ level: 6, feeds: 0, leveledUp: true, evolved: true });
    expect(feedOnce({ level: 6, feeds: 4 })).toEqual({ level: 7, feeds: 0, leveledUp: true, evolved: false });
  });

  it('stops at level 15', () => {
    expect(feedsToLevelUp(15)).toBe(Infinity);
    expect(feedOnce({ level: 15, feeds: 0 })).toEqual({ level: 15, feeds: 0, leveledUp: false, evolved: false });
  });
});

describe('clock times', () => {
  it('converts 12-hour times with AM and PM', () => {
    expect(toClockTime(12, 0, 'AM')).toBe(0);
    expect(toClockTime(7, 5, 'AM')).toBe(425);
    expect(toClockTime(12, 30, 'PM')).toBe(750);
    expect(toClockTime(11, 59, 'PM')).toBe(1439);
    expect(fromClockTime(750)).toEqual({ hour12: 12, minute: 30, meridiem: 'PM' });
    expect(formatClockTime(0)).toBe('12:00 AM');
    expect(formatClockTime(425)).toBe('7:05 AM');
  });
});

describe('one alarm per day', () => {
  it('replaces the existing alarm on a day instead of adding a second one', () => {
    let schedule: WeekSchedule = setAlarm({}, [1, 2, 3], toClockTime(7, 0, 'AM'));
    schedule = setAlarm(schedule, [3, 4], toClockTime(6, 30, 'AM'));
    expect(Object.keys(schedule)).toEqual(['1', '2', '3', '4']);
    expect(schedule[3]).toEqual({ time: 390, on: true });
    expect(schedule[1]).toEqual({ time: 420, on: true });
  });

  it('reports which days would be replaced', () => {
    const schedule = setAlarm({}, [1, 2], 420);
    expect(daysReplaced(schedule, [1, 2, 5], 390)).toEqual([1, 2]);
    expect(daysReplaced(schedule, [1], 420)).toEqual([]);
  });

  it('toggles and removes a day', () => {
    const schedule = setAlarm({}, [0], 540);
    expect(toggleAlarm(schedule, 0)[0]).toEqual({ time: 540, on: false });
    expect(toggleAlarm(schedule, 6)).toBe(schedule);
    expect(removeAlarm(schedule, 0)).toEqual({});
  });
});
