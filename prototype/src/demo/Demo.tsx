import { useEffect, useState } from 'react';
import { BellPalArt } from '../components/BellPalArt';
import { TreatArt } from '../components/TreatArt';
import { BELLPALS, SPECIES, formName } from '../data/bellpals';
import { MAX_LEVEL, STAGE_NAMES, stageForLevel, treatsForLevel, type Stage } from '../domain/rules';
import { formatTimer } from '../domain/schedule';
import { canSnooze, firstRingStartFor, ringPhase, ringStateFor } from '../domain/session';
import { nextAlarmLabel, plural } from '../lib/format';
import { useNow } from '../state/clock';
import { alarmNotice, invitationsForMe, memberView, soonestGroupAlarm } from '../state/selectors';
import { ME, firstName, myGroupOf, useStore, type LiveSession } from '../state/store';
import { LogoMark } from '../phone/Logo';

export function Intro() {
  return (
    <section className="panel intro">
      <div className="intro-brand">
        <LogoMark />
        <span>BellPals</span>
      </div>
      <h1>Clickable prototype</h1>
      <p>Use the phone like the real app. Everything is simulated: there are no real accounts, contacts or alarms, and alarms only ring while this page is open.</p>
      <ol className="try-list">
        <li>Sign in and pick your BellPal.</li>
        <li>On the Pals tab, accept Aisha's invite to Morning Crew.</li>
        <li>
          Press <strong>Ring my alarm now</strong>. Your pals' phones start ringing 24 s later unless you're up.
        </li>
        <li>Swipe, then drag the treat into your BellPal's mouth.</li>
      </ol>
    </section>
  );
}

export function DemoPanel({ onOpenGallery }: { onOpenGallery: () => void }) {
  const { state, dispatch } = useStore();
  const now = useNow();
  const [confirmReset, setConfirmReset] = useState(false);
  const ready = state.signedIn && state.step === 'done' && state.bellpal !== null;
  const group = myGroupOf(state);
  const members = group ? group.memberIds.filter((id) => id !== ME) : [];
  const [friendId, setFriendId] = useState<string>(members[0] ?? '');
  const ownSession = state.sessions.find((s) => s.ownerId === ME && s.offAt === null);
  const friendSession = state.sessions.find((s) => s.ownerId !== ME && s.offAt === null);

  useEffect(() => {
    if (!members.includes(friendId)) setFriendId(members[0] ?? '');
  }, [members, friendId]);

  useEffect(() => {
    if (!confirmReset) return;
    const id = window.setTimeout(() => setConfirmReset(false), 3000);
    return () => window.clearTimeout(id);
  }, [confirmReset]);

  const previewNotifications = () => {
    const soonest = soonestGroupAlarm(state, Date.now());
    const ownerId = soonest?.ownerId ?? ME;
    const time = soonest?.time ?? 7 * 60;
    dispatch({ type: 'banner', ...alarmNotice(state, ownerId, time, 5), now: Date.now() });
    window.setTimeout(() => dispatch({ type: 'banner', ...alarmNotice(state, ownerId, time, 1), now: Date.now() }), 2600);
  };

  return (
    <section className="panel demo-panel" aria-label="Prototype controls">
      <h2>Prototype controls</h2>
      {!ready ? (
        <div className="demo-block">
          <p className="demo-note">Go through sign-up on the phone, or jump straight in with a sample profile.</p>
          <button type="button" className="demo-btn primary" onClick={() => dispatch({ type: 'skipOnboarding' })}>
            Skip sign-up
          </button>
        </div>
      ) : (
        <>
          <div className="demo-block">
            <h3>Alarms</h3>
            <button
              type="button"
              className="demo-btn primary"
              disabled={Boolean(ownSession)}
              onClick={() => dispatch({ type: 'startSession', ownerId: ME, at: Date.now(), scripted: false })}
            >
              Ring my alarm now
            </button>
            <p className="demo-note">{group ? `${group.name} starts ringing 24 s later unless you're up.` : "You're not in a group, so only your phone rings."}</p>
            {members.length > 0 && (
              <div className="demo-row">
                <select value={friendId} onChange={(e) => setFriendId(e.target.value)} aria-label="Whose alarm">
                  {members.map((id) => (
                    <option key={id} value={id}>
                      {firstName(state, id)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="demo-btn"
                  disabled={Boolean(friendSession) || !friendId}
                  onClick={() => dispatch({ type: 'startSession', ownerId: friendId, at: Date.now(), scripted: true })}
                >
                  Ring their alarm
                </button>
              </div>
            )}
            {friendSession && (
              <div className="demo-friend">
                <p className="demo-note">
                  {firstName(state, friendSession.ownerId)} is simulated: snoozes after 35 s, then turns it off 15 s into the second ring. Or take over:
                </p>
                <div className="demo-row">
                  <button
                    type="button"
                    className="demo-btn"
                    disabled={!canSnooze(friendSession, now)}
                    onClick={() => dispatch({ type: 'snooze', sessionId: friendSession.id, now: Date.now(), manual: true })}
                  >
                    {firstName(state, friendSession.ownerId)} snoozes
                  </button>
                  <button type="button" className="demo-btn" onClick={() => dispatch({ type: 'turnOff', sessionId: friendSession.id, now: Date.now() })}>
                    {firstName(state, friendSession.ownerId)} turns it off
                  </button>
                </div>
              </div>
            )}
            <button type="button" className="demo-btn" onClick={previewNotifications}>
              Show the 5-min and 1-min notifications
            </button>
          </div>

          <div className="demo-block">
            <h3>Timing and sound</h3>
            <label className="demo-switch">
              <input type="checkbox" checked={state.fastSnooze} onChange={(e) => dispatch({ type: 'setOption', key: 'fastSnooze', value: e.target.checked })} />
              Fast snooze: 15 s instead of 5 min
            </label>
            <label className="demo-switch">
              <input type="checkbox" checked={state.sound} onChange={(e) => dispatch({ type: 'setOption', key: 'sound', value: e.target.checked })} />
              Alarm sound
            </label>
          </div>

          <div className="demo-block">
            <h3>BellPal level</h3>
            <div className="level-stepper">
              <button type="button" onClick={() => dispatch({ type: 'setLevel', level: state.bellpal!.level - 1 })} disabled={state.bellpal!.level <= 1} aria-label="Lower level">
                −
              </button>
              <span>
                Lv {state.bellpal!.level}
                <small>
                  {formName(state.bellpal!.species, stageForLevel(state.bellpal!.level))} · {plural(treatsForLevel(state.bellpal!.level), 'treat')}
                </small>
              </span>
              <button type="button" onClick={() => dispatch({ type: 'setLevel', level: state.bellpal!.level + 1 })} disabled={state.bellpal!.level >= MAX_LEVEL} aria-label="Raise level">
                +
              </button>
            </div>
            <button type="button" className="demo-btn" onClick={onOpenGallery}>
              See all 15 BellPal forms
            </button>
          </div>
        </>
      )}
      <button type="button" className="demo-btn subtle" onClick={() => (confirmReset ? dispatch({ type: 'reset' }) : setConfirmReset(true))}>
        {confirmReset ? 'Tap again to reset everything' : 'Reset prototype'}
      </button>
    </section>
  );
}

/** Everyone else's phone in the group, live. */
export function GroupSimulator() {
  const { state, dispatch } = useStore();
  const now = useNow();
  const ready = state.signedIn && state.step === 'done' && state.bellpal !== null;
  const group = myGroupOf(state);

  if (!ready) {
    return (
      <section className="panel sim">
        <h2>Your pal group</h2>
        <p className="demo-note">Sign in on the phone to see your group here.</p>
      </section>
    );
  }

  if (!group) {
    const invite = invitationsForMe(state)[0];
    return (
      <section className="panel sim">
        <h2>Your pal group</h2>
        <p className="demo-note">You're not in a group yet, so your alarm only rings on your phone.</p>
        {invite && (
          <button type="button" className="demo-btn primary" onClick={() => dispatch({ type: 'answerInvitation', groupId: invite.id, accept: true, now: Date.now() })}>
            Accept {firstName(state, invite.ownerId)}'s invite to {invite.name}
          </button>
        )}
      </section>
    );
  }

  const session: LiveSession | null =
    state.sessions.find((s) => s.ownerId === ME && s.offAt === null) ??
    state.sessions.find((s) => s.offAt === null && s.memberIds.includes(ME)) ??
    null;

  return (
    <section className="panel sim">
      <h2>{group.name}</h2>
      <p className="demo-note">Your pals' phones, live. {session ? phaseCaption(state, session, now) : 'Quiet right now.'}</p>
      <div className="sim-grid">
        {group.memberIds
          .filter((id) => id !== ME)
          .map((id) => (
            <MiniPhone key={id} id={id} session={session} />
          ))}
      </div>
    </section>
  );
}

function phaseCaption(state: ReturnType<typeof useStore>['state'], session: LiveSession, now: number): string {
  const owner = session.ownerId === ME ? 'Your' : `${firstName(state, session.ownerId)}'s`;
  switch (ringPhase(session, now)) {
    case 'first':
      return `${owner} alarm, first ring.`;
    case 'snoozed':
      return `${owner} alarm is snoozed. Everyone rings together in ${formatTimer((session.secondRingAt ?? now) - now)}.`;
    case 'second':
      return `${owner} alarm, second ring: everyone at once.`;
    case 'off':
      return `${owner} alarm is off.`;
  }
}

function MiniPhone({ id, session }: { id: string; session: LiveSession | null }) {
  const { state } = useStore();
  const now = useNow();
  const m = memberView(state, id);
  if (!m) return null;
  const ring = session ? ringStateFor(session, id, now) : null;
  const isOwner = session?.ownerId === id;

  let label = 'Quiet';
  if (ring === 'ringing') label = isOwner ? 'Ringing (own alarm)' : 'Ringing';
  else if (ring === 'waiting' && session) label = `Rings in ${formatTimer(firstRingStartFor(session, id) - now)}`;
  else if (ring === 'snoozed' && session) label = `Snoozed · ${formatTimer((session.secondRingAt ?? now) - now)}`;

  return (
    <div className={`mini-phone${ring ? ` is-${ring}` : ''}`}>
      <div className="mini-screen">
        <BellPalArt species={m.species} stage={stageForLevel(m.level)} mood={ring === 'ringing' ? 'ringing' : ring === 'snoozed' ? 'sleepy' : 'idle'} label="" />
        <strong>{m.firstName}</strong>
        <span className="mini-state">{label}</span>
        <small>{session ? (isOwner ? 'Their alarm' : `${session.ownerId === ME ? 'Your' : `${firstName(state, session.ownerId)}'s`} alarm`) : `Next: ${nextAlarmLabel(m.alarms, now)}`}</small>
      </div>
    </div>
  );
}

export function Gallery({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="gallery-backdrop" onClick={onClose}>
      <div className="gallery" role="dialog" aria-modal="true" aria-label="All BellPal forms" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-head">
          <div>
            <h2>All 15 BellPal forms</h2>
            <p className="demo-note">5 BellPals × 3 evolution stages. Placeholder art for the prototype.</p>
          </div>
          <button type="button" className="demo-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="gallery-grid">
          <span />
          {([1, 2, 3] as Stage[]).map((stage) => (
            <span key={stage} className="gallery-col-head">
              {STAGE_NAMES[stage]}
              <small>
                Lv {stage === 1 ? '1–5' : stage === 2 ? '6–10' : '11–15'} · {plural(stage, 'treat')}
              </small>
            </span>
          ))}
          {SPECIES.map((species) => (
            <GalleryRow key={species} species={species} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryRow({ species }: { species: (typeof SPECIES)[number] }) {
  const info = BELLPALS[species];
  return (
    <>
      <span className="gallery-row-head">
        <strong>{info.name}</strong>
        <small>
          <TreatArt kind={info.treat} /> {info.treatName}
        </small>
      </span>
      {([1, 2, 3] as Stage[]).map((stage) => (
        <figure key={stage} className="gallery-cell">
          <BellPalArt species={species} stage={stage} mood={stage === 3 ? 'happy' : 'idle'} />
          <figcaption>{formName(species, stage)}</figcaption>
        </figure>
      ))}
    </>
  );
}
