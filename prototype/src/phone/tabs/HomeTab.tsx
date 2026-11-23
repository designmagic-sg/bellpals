import { useEffect, useRef, useState } from 'react';
import type { Mood } from '../../components/BellPalArt';
import { Icon } from '../../components/Icons';
import { PetRoom } from '../../components/PetRoom';
import { TreatArt } from '../../components/TreatArt';
import { Button, PalAvatar, Toggle } from '../../components/ui';
import { BELLPALS, formName } from '../../data/bellpals';
import { MAX_LEVEL, feedsToLevelUp, formatClockTime, stageForLevel, treatsForLevel, type WeekSchedule } from '../../domain/rules';
import { formatUntil, nextOccurrence, todaysAlarm } from '../../domain/schedule';
import { clockWithSeconds, longDate, plural, relativeDay } from '../../lib/format';
import { useNow } from '../../state/clock';
import { invitationsForMe, memberView } from '../../state/selectors';
import { firstName, myGroupOf, useStore } from '../../state/store';
import { usePhoneUI } from '../PhoneUI';

/** The same schedule with every alarm switched on, to find the next one even if it's off. */
function allOn(alarms: WeekSchedule): WeekSchedule {
  return Object.fromEntries(Object.entries(alarms).map(([day, a]) => [day, a && { ...a, on: true }])) as WeekSchedule;
}

/** Night in the pet's room: it sleeps from 9 pm until 6 am. */
function isNight(now: number): boolean {
  const h = new Date(now).getHours();
  return h >= 21 || h < 6;
}

export function HomeTab() {
  const { state, dispatch } = useStore();
  const now = useNow();
  const ui = usePhoneUI();
  const bp = state.bellpal!;
  const info = BELLPALS[bp.species];
  const stage = stageForLevel(bp.level);
  const need = feedsToLevelUp(bp.level);
  const treats = treatsForLevel(bp.level);
  const group = myGroupOf(state);
  const invites = invitationsForMe(state);
  const next = nextOccurrence(state.alarms, now);
  // The hero shows the next scheduled alarm even when it's switched off, so its toggle behaves.
  const upcoming = nextOccurrence(allOn(state.alarms), now);
  const upcomingOn = upcoming ? (state.alarms[upcoming.day]?.on ?? false) : false;
  const night = isNight(now);
  const name = formName(bp.species, stage);

  const [mood, setMood] = useState<Mood>('idle');
  const [bubble, setBubble] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pet = () => {
    const lines = night
      ? ['Zzz… five more minutes…', next ? `Wake me at ${formatClockTime(next.time)}!` : 'Set an alarm so I can eat!', 'Mmm… honey…']
      : [
          next ? `See you ${relativeDay(next.at, now).toLowerCase()} at ${formatClockTime(next.time)}!` : 'Set an alarm so I can eat!',
          `I could eat a ${info.treatName} right now.`,
          'Boop!',
          `${plural(treats, 'treat')} per morning, please.`,
        ];
    setMood('happy');
    setBubble(lines[Math.floor(Math.random() * lines.length)]!);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMood('idle');
      setBubble(null);
    }, 2000);
  };

  const nextEvolution = bp.level < 6 ? 'Evolves at Lv 6' : bp.level < 11 ? 'Evolves at Lv 11' : 'Final form';

  return (
    <div className="screen home">
      <header className="screen-head">
        <small>{longDate(now)}</small>
        <h1>Hi {state.profile.fullName.split(' ')[0]}</h1>
      </header>

      <section className="hero-card">
        <PetRoom species={bp.species} stage={stage} night={night} mood={mood} onPet={pet} label={`Pet ${name}`}>
          <span className="glass-chip room-chip">
            <Icon name={night ? 'moon' : 'sparkle'} />
            {night ? `${info.name} is asleep` : `Tap ${info.name} to say hi`}
          </span>
          {bubble && (
            <span className="bubble" role="status">
              {bubble}
            </span>
          )}
        </PetRoom>

        <div className="hero-alarm">
          <div className="hero-alarm-text">
            <span className="label">Your next alarm</span>
            {upcoming ? (
              <>
                <strong className={`next-time${upcomingOn ? '' : ' off'}`}>{formatClockTime(upcoming.time)}</strong>
                <span className="muted">{upcomingOn ? `${relativeDay(upcoming.at, now)} · in ${formatUntil(upcoming.at - now)}` : `${relativeDay(upcoming.at, now)} · switched off`}</span>
              </>
            ) : (
              <>
                <strong className="next-time none">None set</strong>
                <button type="button" className="link-btn" onClick={() => ui.setTab('alarms')}>
                  Set an alarm
                </button>
              </>
            )}
          </div>
          {upcoming && (
            <Toggle checked={upcomingOn} label={`${relativeDay(upcoming.at, now)}'s alarm`} onChange={() => dispatch({ type: 'toggleAlarm', day: upcoming.day })} />
          )}
        </div>

        <div className="hero-level">
          <div className="pet-title">
            <strong>
              {name} · Lv {bp.level}
            </strong>
            <span className="muted">{bp.level < MAX_LEVEL ? `${bp.feeds} of ${need} feeds to Lv ${bp.level + 1}` : 'Max level'}</span>
          </div>
          {bp.level < MAX_LEVEL && (
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={bp.feeds} aria-label="Progress to next level">
              <span style={{ width: `${(bp.feeds / need) * 100}%` }} />
            </div>
          )}
          <div className="pet-facts">
            <span className="fact">
              <TreatArt kind={info.treat} />
              {plural(treats, info.treatName)} to turn off your alarm
            </span>
            <span className="fact">
              <Icon name="sparkle" />
              {nextEvolution}
            </span>
          </div>
        </div>
      </section>

      {group ? (
        <section className="group-today">
          <div className="section-head">
            <h2>{group.name}, today</h2>
            <button type="button" className="link-btn" onClick={() => ui.setTab('pals')}>
              See group
            </button>
          </div>
          <ol className="timeline">
            {group.memberIds
              .map((id) => {
                const m = memberView(state, id);
                const alarm = m ? todaysAlarm(m.alarms, now) : null;
                return { id, m, alarm };
              })
              .sort((a, b) => (a.alarm?.at ?? Infinity) - (b.alarm?.at ?? Infinity))
              .map(({ id, m, alarm }) =>
                m ? (
                  <li key={id} className={`${m.isMe ? 'me' : ''}${alarm && alarm.at < now ? ' past' : ''}`}>
                    <span className="tl-time">
                      {alarm ? formatClockTime(alarm.time).replace(/ (AM|PM)$/, '') : '—'}
                      <small>{alarm ? formatClockTime(alarm.time).slice(-2) : ''}</small>
                    </span>
                    <span className="tl-card">
                      <PalAvatar species={m.species} level={m.level} size={42} />
                      <span className="tl-text">
                        <strong>{m.isMe ? 'You' : m.firstName}</strong>
                        <small>
                          {!alarm
                            ? 'No alarm today'
                            : m.isMe
                              ? `Your pals ring at ${clockWithSeconds(alarm.at + 24_000)}`
                              : `Rings you at ${clockWithSeconds(alarm.at + 24_000)} if not up`}
                        </small>
                      </span>
                    </span>
                  </li>
                ) : null,
              )}
          </ol>
          <p className="small muted">Everyone gets a heads-up 5 minutes and 1 minute before each alarm.</p>
        </section>
      ) : invites.length > 0 ? (
        <section className="card invite-teaser">
          <span className="label">You're invited</span>
          <p>
            <strong>{firstName(state, invites[0]!.ownerId)}</strong> invited you to join <strong>{invites[0]!.name}</strong>.
          </p>
          <Button
            small
            onClick={() => {
              ui.setPalsView('group');
              ui.setTab('pals');
            }}
          >
            View invitation
          </Button>
        </section>
      ) : (
        <section className="card">
          <span className="label">Pal group</span>
          <p className="small muted">Start a group with up to 4 friends and wake each other up.</p>
          <Button small variant="secondary" onClick={() => ui.openSheet({ kind: 'createGroup' })}>
            Create a group
          </Button>
        </section>
      )}
    </div>
  );
}
