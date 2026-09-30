import type { Group } from '../domain/groups';
import { setAlarm, toClockTime, type WeekSchedule } from '../domain/rules';
import type { Species } from './bellpals';

// Sample people for the prototype. Everything here is made up.

export const ME = 'me';

export interface Person {
  id: string;
  fullName: string;
  /** What friends call them, if not just the first word of the full name. */
  shortName?: string;
  username: string;
  species: Species;
  level: number;
  alarms: WeekSchedule;
}

export interface Contact {
  id: string;
  name: string;
  /** Set when this contact already uses BellPals. */
  userId?: string;
}

const WEEKDAYS_MON_FRI = [1, 2, 3, 4, 5] as const;
const at = (h: number, m: number) => toClockTime(h, m, 'AM');

export function initialPeople(): Record<string, Person> {
  return {
    aisha: {
      id: 'aisha',
      fullName: 'Aisha Rahman',
      username: 'aisha.r',
      species: 'chime',
      level: 7,
      alarms: setAlarm(setAlarm({}, WEEKDAYS_MON_FRI, at(6, 30)), [6], at(8, 0)),
    },
    jon: { id: 'jon', fullName: 'Jon Tan', username: 'jontan', species: 'gong', level: 3, alarms: setAlarm({}, WEEKDAYS_MON_FRI, at(7, 15)) },
    meiling: {
      id: 'meiling',
      fullName: 'Mei Ling Goh',
      shortName: 'Mei Ling',
      username: 'meiling',
      species: 'jingle',
      level: 12,
      alarms: setAlarm({}, [0, 1, 2, 3, 4, 5, 6], at(6, 45)),
    },
    priya: {
      id: 'priya',
      fullName: 'Priya Nair',
      username: 'priya.n',
      species: 'buzz',
      level: 5,
      alarms: setAlarm(setAlarm({}, [1, 3, 5], at(6, 0)), [0], at(9, 30)),
    },
    sam: { id: 'sam', fullName: 'Sam Wong', username: 'samwong', species: 'ding', level: 1, alarms: {} },
    daniel: { id: 'daniel', fullName: 'Daniel Koh', username: 'dankoh', species: 'buzz', level: 9, alarms: setAlarm({}, [2, 4], at(5, 45)) },
    farah: {
      id: 'farah',
      fullName: 'Farah Ismail',
      username: 'farah.i',
      species: 'gong',
      level: 14,
      alarms: setAlarm({}, [1, 2, 3, 4, 5, 6], at(7, 0)),
    },
  };
}

export const INITIAL_FRIENDS = ['aisha', 'jon', 'meiling', 'priya'];
export const INITIAL_INCOMING_REQUESTS = ['sam'];

export function initialGroups(): Record<string, Group> {
  return {
    crew: { id: 'crew', name: 'Morning Crew', ownerId: 'aisha', memberIds: ['aisha', 'jon', 'meiling'], invitedIds: [ME] },
  };
}

export const CONTACTS: readonly Contact[] = [
  { id: 'c-aisha', name: 'Aisha Rahman', userId: 'aisha' },
  { id: 'c-daniel', name: 'Daniel Koh', userId: 'daniel' },
  { id: 'c-farah', name: 'Farah Ismail', userId: 'farah' },
  { id: 'c-grace', name: 'Grace Teo' },
  { id: 'c-kumar', name: 'Kumar Suresh' },
  { id: 'c-mum', name: 'Mum' },
  { id: 'c-priya', name: 'Priya Nair', userId: 'priya' },
];

export const SAMPLE_GOOGLE_EMAIL = 'you@gmail.com';
export const SAMPLE_APPLE_EMAIL = 'k7x2m9@privaterelay.appleid.com';
