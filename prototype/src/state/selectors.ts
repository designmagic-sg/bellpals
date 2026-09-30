import type { Species } from '../data/bellpals';
import type { Group } from '../domain/groups';
import { formatClockTime, type WeekSchedule } from '../domain/rules';
import { nextOccurrence } from '../domain/schedule';
import { ringStateFor, type RingState } from '../domain/session';
import { ME, firstName, myGroupOf, type AppState, type LiveSession } from './store';

export interface MemberView {
  id: string;
  fullName: string;
  firstName: string;
  username: string;
  species: Species;
  level: number;
  alarms: WeekSchedule;
  isMe: boolean;
}

export function memberView(state: AppState, id: string): MemberView | null {
  if (id === ME) {
    if (!state.bellpal) return null;
    return {
      id,
      fullName: state.profile.fullName,
      firstName: 'You',
      username: state.profile.username,
      species: state.bellpal.species,
      level: state.bellpal.level,
      alarms: state.alarms,
      isMe: true,
    };
  }
  const person = state.people[id];
  if (!person) return null;
  return { ...person, firstName: firstName(state, id), isMe: false };
}

export function invitationsForMe(state: AppState): Group[] {
  return Object.values(state.groups).filter((g) => g.invitedIds.includes(ME));
}

export function groupOf(state: AppState, userId: string): Group | null {
  return Object.values(state.groups).find((g) => g.memberIds.includes(userId)) ?? null;
}

/** The session my phone should show: my own alarm first, then a friend's. */
export function sessionsForMe(state: AppState): { own: LiveSession | null; friend: LiveSession | null } {
  const own = state.sessions.find((s) => s.ownerId === ME && s.offAt === null) ?? null;
  const friend = state.sessions.find((s) => s.ownerId !== ME && s.memberIds.includes(ME)) ?? null;
  return { own, friend };
}

export function myRingingKind(state: AppState, now: number): 'own' | 'friend' | null {
  let kind: 'own' | 'friend' | null = null;
  for (const s of state.sessions) {
    if (ringStateFor(s, ME, now) !== 'ringing') continue;
    if (s.ownerId === ME) return 'own';
    kind = 'friend';
  }
  return kind;
}

export function stateFor(session: LiveSession | null, memberId: string, now: number): RingState | null {
  return session ? ringStateFor(session, memberId, now) : null;
}

/** The two heads-up notifications every member of the group receives. */
export function alarmNotice(state: AppState, ownerId: string, time: number, minutes: number): { title: string; body: string } {
  const when = formatClockTime(time);
  const unit = minutes === 1 ? 'minute' : 'minutes';
  const group = myGroupOf(state);
  if (ownerId === ME) {
    return {
      title: `Your alarm in ${minutes} ${unit}`,
      body: group ? `${when}. If you're not up within 24 s, ${group.name} rings too.` : `${when}.`,
    };
  }
  const name = firstName(state, ownerId);
  return { title: `${name}'s alarm in ${minutes} ${unit}`, body: `${when}. Your phone rings 24 s later if ${name} isn't up.` };
}

/** The soonest upcoming alarm among me and my group, for previewing notifications. */
export function soonestGroupAlarm(state: AppState, now: number): { ownerId: string; at: number; time: number } | null {
  const group = myGroupOf(state);
  const owners = group ? group.memberIds : [ME];
  let best: { ownerId: string; at: number; time: number } | null = null;
  for (const ownerId of owners) {
    const schedule = ownerId === ME ? state.alarms : state.people[ownerId]?.alarms;
    const next = schedule ? nextOccurrence(schedule, now) : null;
    if (next && (!best || next.at < best.at)) best = { ownerId, at: next.at, time: next.time };
  }
  return best;
}
