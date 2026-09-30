import { GROUP_RING_DELAY_MS } from './rules';

/**
 * One alarm going off for a pal group.
 * - The owner's phone rings at `firstRingAt`; everyone else's rings 24 s later.
 * - Phones keep ringing until the owner turns the alarm off.
 * - The owner can snooze once; the second ring then starts on every phone at the same moment.
 */
export interface RingSession {
  id: string;
  ownerId: string;
  /** Everyone in the group when the alarm went off, owner included. */
  memberIds: string[];
  firstRingAt: number;
  snoozedAt: number | null;
  secondRingAt: number | null;
  offAt: number | null;
}

export type RingState = 'waiting' | 'ringing' | 'snoozed' | 'off';
export type RingPhase = 'first' | 'snoozed' | 'second' | 'off';

export function ringPhase(session: RingSession, now: number): RingPhase {
  if (session.offAt !== null && now >= session.offAt) return 'off';
  if (session.secondRingAt !== null) return now >= session.secondRingAt ? 'second' : 'snoozed';
  return 'first';
}

/** When this person's phone starts ringing for the first ring. */
export function firstRingStartFor(session: RingSession, memberId: string): number {
  return memberId === session.ownerId ? session.firstRingAt : session.firstRingAt + GROUP_RING_DELAY_MS;
}

export function ringStateFor(session: RingSession, memberId: string, now: number): RingState {
  if (!session.memberIds.includes(memberId)) return 'off';
  switch (ringPhase(session, now)) {
    case 'off':
      return 'off';
    case 'snoozed':
      return 'snoozed';
    case 'second':
      return 'ringing';
    case 'first':
      return now >= firstRingStartFor(session, memberId) ? 'ringing' : 'waiting';
  }
}

/** Snooze is allowed once, during the first ring. */
export function canSnooze(session: RingSession, now: number): boolean {
  return session.offAt === null && session.snoozedAt === null && now >= session.firstRingAt;
}

export function snooze(session: RingSession, now: number, snoozeMs: number): RingSession {
  if (!canSnooze(session, now)) return session;
  return { ...session, snoozedAt: now, secondRingAt: now + snoozeMs };
}

/** Only the owner turns the alarm off (by feeding their BellPal); it stops for everyone. */
export function turnOff(session: RingSession, now: number): RingSession {
  if (session.offAt !== null || now < session.firstRingAt) return session;
  return { ...session, offAt: now };
}

/** Did anyone besides the owner end up ringing? */
export function wokeOthers(session: RingSession): boolean {
  if (session.memberIds.length <= 1) return false;
  const end = session.offAt ?? Infinity;
  const firstPhaseEnd = Math.min(end, session.snoozedAt ?? Infinity);
  if (firstPhaseEnd > session.firstRingAt + GROUP_RING_DELAY_MS) return true;
  return session.secondRingAt !== null && end > session.secondRingAt;
}
