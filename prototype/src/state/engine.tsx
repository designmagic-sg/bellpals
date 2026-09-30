import { useEffect, type Dispatch } from 'react';
import { notificationInstants, todaysAlarm } from '../domain/schedule';
import { startRinging, stopRinging } from '../lib/audio';
import { useNow } from './clock';
import { alarmNotice, myRingingKind } from './selectors';
import { ME, myGroupOf, useStore, type Action, type AppState } from './store';

/**
 * Drives everything time-based: simulated replies from friends, simulated friends
 * snoozing and turning off their alarms, real alarms at their set times (while the
 * page is open), the 5-minute and 1-minute notifications, and the alarm sound.
 */
export function Engine() {
  const { state, dispatch } = useStore();
  const now = useNow();

  useEffect(() => {
    for (const pending of state.sims) {
      if (pending.at <= now) dispatch({ type: 'runSim', id: pending.id, now });
    }
    for (const s of state.sessions) {
      if (!s.script || s.offAt !== null) continue;
      if (s.snoozedAt === null && s.script.snoozeAfterMs !== null && now >= s.firstRingAt + s.script.snoozeAfterMs) {
        dispatch({ type: 'snooze', sessionId: s.id, now });
      } else if (s.secondRingAt !== null && now >= s.secondRingAt + s.script.offAfterSecondMs) {
        dispatch({ type: 'turnOff', sessionId: s.id, now });
      }
    }
    if (state.signedIn && state.step === 'done') runSchedule(state, now, dispatch);
    dispatch({ type: 'prune', now });
    // Runs once per tick with the state of that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const ringing = myRingingKind(state, now);
  useEffect(() => {
    if (ringing && state.sound) startRinging(ringing);
    else stopRinging();
  }, [ringing, state.sound]);
  useEffect(() => stopRinging, []);

  return null;
}

function runSchedule(state: AppState, now: number, dispatch: Dispatch<Action>) {
  const group = myGroupOf(state);
  const owners = group ? group.memberIds : [ME];
  for (const ownerId of owners) {
    const schedule = ownerId === ME ? state.alarms : state.people[ownerId]?.alarms;
    const alarm = schedule ? todaysAlarm(schedule, now) : null;
    if (!alarm) continue;
    const base = `${ownerId}|${new Date(alarm.at).toDateString()}|${alarm.time}`;
    const due = (suffix: string, at: number) => {
      const key = `${base}|${suffix}`;
      if (now < at || now >= at + 60_000 || state.fired.includes(key)) return false;
      dispatch({ type: 'fire', key });
      return true;
    };
    const [fiveMin, oneMin] = notificationInstants(alarm.at);
    if (due('5min', fiveMin!)) dispatch({ type: 'banner', ...alarmNotice(state, ownerId, alarm.time, 5), now });
    if (due('1min', oneMin!)) dispatch({ type: 'banner', ...alarmNotice(state, ownerId, alarm.time, 1), now });
    if (due('ring', alarm.at)) dispatch({ type: 'startSession', ownerId, at: alarm.at, scripted: true });
  }
}
