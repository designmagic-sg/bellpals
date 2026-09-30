import { describe, expect, it } from 'vitest';
import { GROUP_RING_DELAY_MS } from './rules';
import { canSnooze, ringPhase, ringStateFor, snooze, turnOff, wokeOthers, type RingSession } from './session';

const T = 1_000_000;
const SNOOZE = 5 * 60_000;
const base: RingSession = {
  id: 's1',
  ownerId: 'me',
  memberIds: ['me', 'aisha', 'jon'],
  firstRingAt: T,
  snoozedAt: null,
  secondRingAt: null,
  offAt: null,
};

describe('first ring', () => {
  it("rings the owner first and everyone else 24 s later", () => {
    expect(ringStateFor(base, 'me', T)).toBe('ringing');
    expect(ringStateFor(base, 'aisha', T)).toBe('waiting');
    expect(ringStateFor(base, 'aisha', T + GROUP_RING_DELAY_MS - 1)).toBe('waiting');
    expect(ringStateFor(base, 'aisha', T + GROUP_RING_DELAY_MS)).toBe('ringing');
  });

  it('keeps ringing for everyone until the owner turns it off', () => {
    expect(ringStateFor(base, 'jon', T + 10 * 60_000)).toBe('ringing');
    const off = turnOff(base, T + 90_000);
    expect(ringStateFor(off, 'jon', T + 90_000)).toBe('off');
    expect(ringStateFor(off, 'me', T + 90_000)).toBe('off');
  });

  it("spares the group if the owner is up within 24 s", () => {
    const off = turnOff(base, T + 15_000);
    expect(ringStateFor(off, 'aisha', T + GROUP_RING_DELAY_MS)).toBe('off');
    expect(wokeOthers(off)).toBe(false);
  });

  it('ignores people outside the group', () => {
    expect(ringStateFor(base, 'stranger', T + 60_000)).toBe('off');
  });
});

describe('snooze', () => {
  it('silences everyone, then rings everyone together with no delay', () => {
    const snoozed = snooze(base, T + 40_000, SNOOZE);
    const second = T + 40_000 + SNOOZE;
    expect(ringPhase(snoozed, T + 60_000)).toBe('snoozed');
    expect(ringStateFor(snoozed, 'me', T + 60_000)).toBe('snoozed');
    expect(ringStateFor(snoozed, 'aisha', T + 60_000)).toBe('snoozed');
    expect(ringPhase(snoozed, second)).toBe('second');
    for (const id of snoozed.memberIds) expect(ringStateFor(snoozed, id, second)).toBe('ringing');
  });

  it('only works once', () => {
    const snoozed = snooze(base, T + 5_000, SNOOZE);
    expect(canSnooze(snoozed, T + SNOOZE + 10_000)).toBe(false);
    expect(snooze(snoozed, T + SNOOZE + 10_000, SNOOZE)).toBe(snoozed);
  });

  it('can be followed by turning the alarm off', () => {
    const snoozed = snooze(base, T + 5_000, SNOOZE);
    const off = turnOff(snoozed, T + SNOOZE + 20_000);
    expect(ringPhase(off, T + SNOOZE + 20_000)).toBe('off');
  });

  it('counts the shared second ring as waking the group', () => {
    const snoozedEarly = snooze(base, T + 5_000, SNOOZE);
    expect(wokeOthers(turnOff(snoozedEarly, T + 7_000))).toBe(false);
    expect(wokeOthers(turnOff(snoozedEarly, T + 5_000 + SNOOZE + 3_000))).toBe(true);
  });
});

describe('solo alarms', () => {
  it('never wake anyone else', () => {
    const solo = { ...base, memberIds: ['me'] };
    expect(wokeOthers(turnOff(solo, T + 10 * 60_000))).toBe(false);
  });
});
