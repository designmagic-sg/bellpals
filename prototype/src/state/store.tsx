import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Species } from '../data/bellpals';
import {
  CONTACTS,
  INITIAL_FRIENDS,
  INITIAL_INCOMING_REQUESTS,
  ME,
  SAMPLE_APPLE_EMAIL,
  SAMPLE_GOOGLE_EMAIL,
  initialGroups,
  initialPeople,
  type Person,
} from '../data/mock';
import {
  acceptInvite,
  canAcceptInvite,
  canCreateGroup,
  canDelete,
  canInvite,
  canLeave,
  declineInvite,
  removeMember,
  type Group,
} from '../domain/groups';
import {
  DEMO_SNOOZE_MS,
  MAX_GROUP_MEMBERS,
  SNOOZE_MS,
  clampLevel,
  feedOnce,
  removeAlarm,
  setAlarm,
  toClockTime,
  toggleAlarm,
  type ClockTime,
  type FeedResult,
  type Weekday,
  type WeekSchedule,
} from '../domain/rules';
import { snooze, turnOff, wokeOthers, type RingSession } from '../domain/session';

export interface Profile {
  fullName: string;
  username: string;
  googleEmail: string | null;
  appleEmail: string | null;
}

export interface MyBellPal {
  species: Species;
  level: number;
  feeds: number;
}

/** A ring session plus the scripted behaviour of a simulated owner. */
export interface LiveSession extends RingSession {
  script: { snoozeAfterMs: number | null; offAfterSecondMs: number } | null;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  at: number;
}

export type Sim = { kind: 'friendAccepts'; userId: string } | { kind: 'inviteAnswered'; groupId: string; userId: string };

export interface PendingSim {
  id: string;
  at: number;
  sim: Sim;
}

export type OnboardingStep = 'profile' | 'bellpal' | 'alarm' | 'done';

export interface LastFeed extends FeedResult {
  sessionId: string;
  /** Did the owner's alarm end up ringing anyone else's phone? */
  woke: boolean;
  wokeCount: number;
  groupSize: number;
}

export interface AppState {
  signedIn: boolean;
  step: OnboardingStep;
  profile: Profile;
  bellpal: MyBellPal | null;
  alarms: WeekSchedule;
  people: Record<string, Person>;
  friends: string[];
  incoming: string[];
  outgoing: string[];
  contactsAllowed: boolean;
  groups: Record<string, Group>;
  sessions: LiveSession[];
  banners: Notice[];
  toasts: Notice[];
  sims: PendingSim[];
  fired: string[];
  lastFeed: LastFeed | null;
  fastSnooze: boolean;
  sound: boolean;
}

export function initialState(): AppState {
  return {
    signedIn: false,
    step: 'profile',
    profile: { fullName: 'Alex Lim', username: 'alexlim', googleEmail: null, appleEmail: null },
    bellpal: null,
    alarms: {},
    people: initialPeople(),
    friends: [...INITIAL_FRIENDS],
    incoming: [...INITIAL_INCOMING_REQUESTS],
    outgoing: [],
    contactsAllowed: false,
    groups: initialGroups(),
    sessions: [],
    banners: [],
    toasts: [],
    sims: [],
    fired: [],
    lastFeed: null,
    fastSnooze: true,
    sound: true,
  };
}

export type Action =
  | { type: 'signIn'; provider: 'google' | 'apple' }
  | { type: 'saveProfile'; fullName: string; username: string }
  | { type: 'chooseBellPal'; species: Species }
  | { type: 'finishOnboarding'; days: Weekday[]; time: ClockTime | null }
  | { type: 'skipOnboarding' }
  | { type: 'setAlarm'; days: Weekday[]; time: ClockTime }
  | { type: 'toggleAlarm'; day: Weekday }
  | { type: 'removeAlarm'; day: Weekday }
  | { type: 'allowContacts' }
  | { type: 'sendFriendRequest'; userId: string; now: number }
  | { type: 'answerFriendRequest'; userId: string; accept: boolean; now: number }
  | { type: 'createGroup'; name: string; now: number }
  | { type: 'invite'; userId: string; now: number }
  | { type: 'answerInvitation'; groupId: string; accept: boolean; now: number }
  | { type: 'leaveGroup'; now: number }
  | { type: 'deleteGroup'; now: number }
  | { type: 'startSession'; ownerId: string; at: number; scripted: boolean }
  | { type: 'snooze'; sessionId: string; now: number; manual?: boolean }
  | { type: 'turnOff'; sessionId: string; now: number }
  | { type: 'clearLastFeed' }
  | { type: 'banner'; title: string; body: string; now: number }
  | { type: 'dismissBanner'; id: string }
  | { type: 'toast'; text: string; now: number }
  | { type: 'runSim'; id: string; now: number }
  | { type: 'fire'; key: string }
  | { type: 'prune'; now: number }
  | { type: 'setLevel'; level: number }
  | { type: 'setOption'; key: 'fastSnooze' | 'sound'; value: boolean }
  | { type: 'updateProfile'; fullName: string; username: string }
  | { type: 'link'; provider: 'google' | 'apple' }
  | { type: 'signOut' }
  | { type: 'deleteAccount'; now: number }
  | { type: 'reset' };

let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function myGroupOf(state: AppState): Group | null {
  return Object.values(state.groups).find((g) => g.memberIds.includes(ME)) ?? null;
}

function groupOfUser(state: AppState, userId: string): Group | null {
  return Object.values(state.groups).find((g) => g.memberIds.includes(userId)) ?? null;
}

export function firstName(state: AppState, userId: string): string {
  if (userId === ME) return 'You';
  const person = state.people[userId];
  return person ? (person.shortName ?? person.fullName.split(' ')[0]!) : 'Someone';
}

function withToast(state: AppState, text: string, now: number): AppState {
  return { ...state, toasts: [...state.toasts.slice(-2), { id: newId('t'), title: text, body: '', at: now }] };
}

function putGroup(state: AppState, group: Group): AppState {
  return { ...state, groups: { ...state.groups, [group.id]: group } };
}

function withoutGroup(state: AppState, groupId: string): AppState {
  const groups = { ...state.groups };
  delete groups[groupId];
  return { ...state, groups };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'signIn':
      return {
        ...state,
        signedIn: true,
        profile: {
          ...state.profile,
          googleEmail: action.provider === 'google' ? SAMPLE_GOOGLE_EMAIL : state.profile.googleEmail,
          appleEmail: action.provider === 'apple' ? SAMPLE_APPLE_EMAIL : state.profile.appleEmail,
        },
      };
    case 'saveProfile':
      return { ...state, profile: { ...state.profile, fullName: action.fullName, username: action.username }, step: 'bellpal' };
    case 'chooseBellPal':
      return { ...state, bellpal: { species: action.species, level: 1, feeds: 0 }, step: 'alarm' };
    case 'finishOnboarding':
      return {
        ...state,
        alarms: action.time === null || action.days.length === 0 ? state.alarms : setAlarm(state.alarms, action.days, action.time),
        step: 'done',
      };
    case 'skipOnboarding':
      return {
        ...state,
        signedIn: true,
        step: 'done',
        profile: { ...state.profile, googleEmail: state.profile.googleEmail ?? SAMPLE_GOOGLE_EMAIL },
        bellpal: state.bellpal ?? { species: 'ding', level: 3, feeds: 1 },
        alarms: Object.keys(state.alarms).length ? state.alarms : setAlarm({}, [1, 2, 3, 4, 5], toClockTime(7, 0, 'AM')),
      };
    case 'setAlarm':
      return { ...state, alarms: setAlarm(state.alarms, action.days, action.time) };
    case 'toggleAlarm':
      return { ...state, alarms: toggleAlarm(state.alarms, action.day) };
    case 'removeAlarm':
      return { ...state, alarms: removeAlarm(state.alarms, action.day) };
    case 'allowContacts':
      return { ...state, contactsAllowed: true };
    case 'sendFriendRequest': {
      if (state.friends.includes(action.userId) || state.outgoing.includes(action.userId)) return state;
      return {
        ...state,
        outgoing: [...state.outgoing, action.userId],
        sims: [...state.sims, { id: newId('sim'), at: action.now + 2500, sim: { kind: 'friendAccepts', userId: action.userId } }],
      };
    }
    case 'answerFriendRequest': {
      const next = { ...state, incoming: state.incoming.filter((id) => id !== action.userId) };
      if (!action.accept) return next;
      return withToast({ ...next, friends: [...next.friends, action.userId] }, `You and ${firstName(state, action.userId)} are now friends`, action.now);
    }
    case 'createGroup': {
      if (!canCreateGroup(myGroupOf(state)?.id ?? null).ok) return state;
      const group: Group = { id: newId('g'), name: action.name, ownerId: ME, memberIds: [ME], invitedIds: [] };
      // Joining a group means declining any other pending invitations.
      const groups = Object.fromEntries(Object.entries(state.groups).map(([id, g]) => [id, declineInvite(g, ME)]));
      return withToast({ ...state, groups: { ...groups, [group.id]: group } }, `${action.name} created`, action.now);
    }
    case 'invite': {
      const group = myGroupOf(state);
      if (!group || !canInvite(group, ME, action.userId, state.friends).ok) return state;
      const updated = { ...group, invitedIds: [...group.invitedIds, action.userId] };
      return {
        ...putGroup(state, updated),
        sims: [...state.sims, { id: newId('sim'), at: action.now + 3000, sim: { kind: 'inviteAnswered', groupId: group.id, userId: action.userId } }],
      };
    }
    case 'answerInvitation': {
      const group = state.groups[action.groupId];
      if (!group) return state;
      if (!action.accept) return withToast(putGroup(state, declineInvite(group, ME)), `Declined ${group.name}`, action.now);
      if (!canAcceptInvite(group, ME, myGroupOf(state)?.id ?? null).ok) return state;
      const groups = Object.fromEntries(
        Object.entries(state.groups).map(([id, g]) => [id, id === group.id ? acceptInvite(g, ME) : declineInvite(g, ME)]),
      );
      return withToast({ ...state, groups }, `You joined ${group.name}`, action.now);
    }
    case 'leaveGroup': {
      const group = myGroupOf(state);
      if (!group || !canLeave(group, ME).ok) return state;
      return withToast(putGroup(state, removeMember(group, ME)), `You left ${group.name}`, action.now);
    }
    case 'deleteGroup': {
      const group = myGroupOf(state);
      if (!group || !canDelete(group, ME).ok) return state;
      return withToast(withoutGroup(state, group.id), `${group.name} was deleted`, action.now);
    }
    case 'startSession': {
      const active = state.sessions.some((s) => s.ownerId === action.ownerId && s.offAt === null);
      if (active) return state;
      const group = groupOfUser(state, action.ownerId);
      const session: LiveSession = {
        id: newId('ring'),
        ownerId: action.ownerId,
        memberIds: group ? [...group.memberIds] : [action.ownerId],
        firstRingAt: action.at,
        snoozedAt: null,
        secondRingAt: null,
        offAt: null,
        script: action.scripted && action.ownerId !== ME ? { snoozeAfterMs: 35_000, offAfterSecondMs: 15_000 } : null,
      };
      return { ...state, sessions: [...state.sessions, session] };
    }
    case 'snooze': {
      const snoozeMs = state.fastSnooze ? DEMO_SNOOZE_MS : SNOOZE_MS;
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          if (s.id !== action.sessionId) return s;
          const next = snooze(s, action.now, snoozeMs);
          const script = s.script && action.manual ? { ...s.script, snoozeAfterMs: null } : s.script;
          return { ...next, script };
        }),
      };
    }
    case 'turnOff': {
      const session = state.sessions.find((s) => s.id === action.sessionId);
      if (!session || session.offAt !== null) return state;
      const off: LiveSession = { ...turnOff(session, action.now), script: null };
      const sessions = state.sessions.map((s) => (s.id === off.id ? off : s));
      if (off.ownerId !== ME || !state.bellpal) return { ...state, sessions };
      const result = feedOnce(state.bellpal);
      const woke = wokeOthers(off);
      return {
        ...state,
        sessions,
        bellpal: { ...state.bellpal, level: result.level, feeds: result.feeds },
        lastFeed: { ...result, sessionId: off.id, woke, wokeCount: woke ? off.memberIds.length - 1 : 0, groupSize: off.memberIds.length },
      };
    }
    case 'clearLastFeed':
      return { ...state, lastFeed: null };
    case 'banner':
      return { ...state, banners: [...state.banners.slice(-2), { id: newId('n'), title: action.title, body: action.body, at: action.now }] };
    case 'dismissBanner':
      return { ...state, banners: state.banners.filter((b) => b.id !== action.id) };
    case 'toast':
      return withToast(state, action.text, action.now);
    case 'runSim': {
      const pending = state.sims.find((s) => s.id === action.id);
      if (!pending) return state;
      const next = { ...state, sims: state.sims.filter((s) => s.id !== action.id) };
      const { sim } = pending;
      if (sim.kind === 'friendAccepts') {
        if (!next.outgoing.includes(sim.userId)) return next;
        return withToast(
          { ...next, outgoing: next.outgoing.filter((id) => id !== sim.userId), friends: [...next.friends, sim.userId] },
          `${firstName(state, sim.userId)} accepted your friend request`,
          action.now,
        );
      }
      const group = next.groups[sim.groupId];
      if (!group || !group.invitedIds.includes(sim.userId)) return next;
      const name = firstName(state, sim.userId);
      const elsewhere = groupOfUser(next, sim.userId);
      if (elsewhere) return withToast(putGroup(next, declineInvite(group, sim.userId)), `${name} is already in ${elsewhere.name}, so the invite was declined`, action.now);
      if (group.memberIds.length >= MAX_GROUP_MEMBERS) return putGroup(next, declineInvite(group, sim.userId));
      return withToast(putGroup(next, acceptInvite(group, sim.userId)), `${name} joined ${group.name}`, action.now);
    }
    case 'fire':
      return { ...state, fired: [...state.fired.slice(-200), action.key] };
    case 'prune': {
      const sessions = state.sessions.filter((s) => s.offAt === null || action.now - s.offAt < 8000);
      const banners = state.banners.filter((b) => action.now - b.at < 6500);
      const toasts = state.toasts.filter((t) => action.now - t.at < 3200);
      if (sessions.length === state.sessions.length && banners.length === state.banners.length && toasts.length === state.toasts.length) {
        return state;
      }
      return { ...state, sessions, banners, toasts };
    }
    case 'setLevel':
      return state.bellpal ? { ...state, bellpal: { ...state.bellpal, level: clampLevel(action.level), feeds: 0 } } : state;
    case 'setOption':
      return { ...state, [action.key]: action.value };
    case 'updateProfile':
      return { ...state, profile: { ...state.profile, fullName: action.fullName, username: action.username } };
    case 'link':
      return {
        ...state,
        profile: {
          ...state.profile,
          googleEmail: action.provider === 'google' ? SAMPLE_GOOGLE_EMAIL : state.profile.googleEmail,
          appleEmail: action.provider === 'apple' ? SAMPLE_APPLE_EMAIL : state.profile.appleEmail,
        },
      };
    case 'signOut':
      return { ...state, signedIn: false, sessions: [], banners: [], lastFeed: null };
    case 'deleteAccount':
      return withToast({ ...initialState(), fastSnooze: state.fastSnooze, sound: state.sound }, 'Your account has been deleted', action.now);
    case 'reset':
      return initialState();
  }
}

// ---- Persistence (per browser; the prototype has no server) -----------------

const STORAGE_KEY = 'bellpals-prototype-v1';
type Saved = Omit<AppState, 'sessions' | 'banners' | 'toasts' | 'sims' | 'lastFeed'>;

function load(): AppState {
  const base = initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<Saved>;
    return { ...base, ...saved, sessions: [], banners: [], toasts: [], sims: [], lastFeed: null };
  } catch {
    return base;
  }
}

function save(state: AppState) {
  const saved: Partial<AppState> = { ...state };
  delete saved.sessions;
  delete saved.banners;
  delete saved.toasts;
  delete saved.sims;
  delete saved.lastFeed;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Storage can be unavailable (private mode, embedded previews); the prototype still works.
  }
}

interface Store {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => save(state), [state]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export { CONTACTS, ME };
