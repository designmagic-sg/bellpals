import { useEffect, useRef, useState } from 'react';
import { BellPalArt, type Mood } from '../../components/BellPalArt';
import { Icon } from '../../components/Icons';
import { TreatArt } from '../../components/TreatArt';
import { Button, PalAvatar } from '../../components/ui';
import { BELLPALS, formName } from '../../data/bellpals';
import { MAX_LEVEL, feedsToLevelUp, formatClockTime, stageForLevel, treatsForLevel } from '../../domain/rules';
import { formatUntil, nextOccurrence, todaysAlarm } from '../../domain/schedule';
import { greeting, plural, relativeDay } from '../../lib/format';
import { useNow } from '../../state/clock';
import { invitationsForMe, memberView } from '../../state/selectors';
import { firstName, myGroupOf, useStore } from '../../state/store';
import { usePhoneUI } from '../PhoneUI';

export function HomeTab() {
  const { state } = useStore();
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

  const [mood, setMood] = useState<Mood>('idle');
  const [bubble, setBubble] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pet = () => {
    const lines = [
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
    }, 1800);
  };

  const nextEvolution = bp.level < 6 ? 'Evolves at Lv 6' : bp.level < 11 ? 'Evolves at Lv 11' : 'Final form';

  return (
    <div className="screen home">
      <header className="screen-head">
        <small>{greeting(now)},</small>
        <h1>{state.profile.fullName.split(' ')[0]}</h1>
      </header>

      <section className="pet-card" style={{ ['--pet' as string]: info.body }}>
        <button type="button" className="pet-stage" onClick={pet} aria-label={`Pet ${formName(bp.species, stage)}`}>
          <BellPalArt species={bp.species} stage={stage} mood={mood} />
          {bubble && <span className="bubble">{bubble}</span>}
        </button>
        <div className="pet-meta">
          <div className="pet-title">
            <h2>{formName(bp.species, stage)}</h2>
            <span className="lv">Lv {bp.level}</span>
          </div>
          {bp.level < MAX_LEVEL ? (
            <>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={bp.feeds} aria-label="Progress to next level">
                <span style={{ width: `${(bp.feeds / need) * 100}%` }} />
              </div>
              <small className="muted">
                {bp.feeds} of {need} fed mornings to Lv {bp.level + 1}
              </small>
            </>
          ) : (
            <small className="muted">Max level. Legendary!</small>
          )}
          <div className="pet-facts">
            <span className="fact">
              <TreatArt kind={info.treat} />
              {plural(treats, 'treat')} to turn off your alarm
            </span>
            <span className="fact">
              <Icon name="sparkle" />
              {nextEvolution}
            </span>
          </div>
        </div>
      </section>

      <section className="card next-alarm">
        <span className="label">Your next alarm</span>
        {next ? (
          <>
            <div className="next-row">
              <strong className="next-time">
                {relativeDay(next.at, now)} {formatClockTime(next.time)}
              </strong>
              <span className="muted">in {formatUntil(next.at - now)}</span>
            </div>
            <p className="small muted">
              {group ? `If you're not up within 24 s, everyone in ${group.name} starts ringing too.` : 'Solo alarm. Join a pal group to wake up together.'}
            </p>
          </>
        ) : (
          <p className="small muted">No alarm set yet.</p>
        )}
        <Button variant="secondary" small onClick={() => ui.setTab('alarms')}>
          {next ? 'Edit alarms' : 'Set an alarm'}
        </Button>
      </section>

      {group ? (
        <section className="card group-today">
          <div className="card-title">
            <span className="label">{group.name} today</span>
            <button type="button" className="link-btn" onClick={() => ui.setTab('pals')}>
              See group
            </button>
          </div>
          <ul className="today-list">
            {group.memberIds
              .map((id) => {
                const m = memberView(state, id);
                const alarm = m ? todaysAlarm(m.alarms, now) : null;
                return { id, m, alarm };
              })
              .sort((a, b) => (a.alarm?.at ?? Infinity) - (b.alarm?.at ?? Infinity))
              .map(({ id, m, alarm }) =>
                m ? (
                  <li key={id}>
                    <PalAvatar species={m.species} level={m.level} size={36} />
                    <span className="today-name">{m.isMe ? 'You' : m.firstName}</span>
                    <span className={`today-time${alarm && alarm.at < now ? ' past' : ''}`}>{alarm ? formatClockTime(alarm.time) : 'No alarm'}</span>
                  </li>
                ) : null,
              )}
          </ul>
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
