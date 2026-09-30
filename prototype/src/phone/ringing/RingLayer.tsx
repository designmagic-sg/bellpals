import { useEffect, useState } from 'react';
import { BellPalArt } from '../../components/BellPalArt';
import { FeedingGame } from '../../components/FeedingGame';
import { Icon } from '../../components/Icons';
import { SwipeToStop } from '../../components/SwipeToStop';
import { Button, PalAvatar } from '../../components/ui';
import { BELLPALS, formName } from '../../data/bellpals';
import { DEMO_SNOOZE_MS, GROUP_RING_DELAY_MS, MAX_LEVEL, SNOOZE_MS, feedsToLevelUp, stageForLevel, treatsForLevel } from '../../domain/rules';
import { formatTimer } from '../../domain/schedule';
import { canSnooze, firstRingStartFor, ringPhase, ringStateFor, wokeOthers } from '../../domain/session';
import { clockParts, clockWithSeconds, joinNames, longDate, plural } from '../../lib/format';
import { useNow } from '../../state/clock';
import { memberView, sessionsForMe } from '../../state/selectors';
import { ME, firstName, myGroupOf, useStore, type LiveSession } from '../../state/store';

/** Decides which alarm screen (if any) covers the app right now. */
export function RingLayer() {
  const { state, dispatch } = useStore();
  const now = useNow();
  const [feedingId, setFeedingId] = useState<string | null>(null);
  const [hiddenSnooze, setHiddenSnooze] = useState<string | null>(null);
  const [hiddenFriend, setHiddenFriend] = useState<string | null>(null);
  const [seenUp, setSeenUp] = useState<string | null>(null);
  const { own, friend } = sessionsForMe(state);

  if (state.lastFeed) return <ResultScreen />;

  if (own) {
    const mine = ringStateFor(own, ME, now);
    if (feedingId === own.id) {
      return (
        <FeedingScreen
          onFed={() => {
            dispatch({ type: 'turnOff', sessionId: own.id, now: Date.now() });
            setFeedingId(null);
          }}
        />
      );
    }
    if (mine === 'ringing') return <OwnRinging session={own} onSwiped={() => setFeedingId(own.id)} />;
    if (mine === 'snoozed') {
      if (hiddenSnooze !== own.id) return <SnoozedScreen session={own} onHide={() => setHiddenSnooze(own.id)} onUpNow={() => setFeedingId(own.id)} />;
      return (
        <button type="button" className="float-pill" onClick={() => setHiddenSnooze(null)}>
          <Icon name="moon" />
          Snoozed · rings again in {formatTimer((own.secondRingAt ?? now) - now)}
        </button>
      );
    }
  }

  if (friend) {
    const mine = ringStateFor(friend, ME, now);
    const name = firstName(state, friend.ownerId);
    if (mine === 'ringing') return <FriendRinging session={friend} />;
    if (mine === 'snoozed') {
      if (hiddenFriend !== friend.id) return <FriendSnoozed session={friend} onHide={() => setHiddenFriend(friend.id)} />;
      return (
        <button type="button" className="float-pill" onClick={() => setHiddenFriend(null)}>
          <Icon name="moon" />
          {name} snoozed · everyone rings in {formatTimer((friend.secondRingAt ?? now) - now)}
        </button>
      );
    }
    if (mine === 'waiting') {
      return (
        <div className="float-pill warn" role="status">
          <Icon name="bell" />
          {name}'s alarm is ringing · yours starts in {formatTimer(firstRingStartFor(friend, ME) - now)}
        </div>
      );
    }
    if (mine === 'off' && friend.offAt !== null && now - friend.offAt < 6000 && wokeOthers(friend) && seenUp !== friend.id) {
      return <FriendUp session={friend} onDismiss={() => setSeenUp(friend.id)} />;
    }
  }
  return null;
}

function Clock({ now }: { now: number }) {
  const { hm, meridiem } = clockParts(now);
  return (
    <div className="ring-clock">
      {hm}
      <small>{meridiem}</small>
    </div>
  );
}

function OwnRinging({ session, onSwiped }: { session: LiveSession; onSwiped: () => void }) {
  const { state, dispatch } = useStore();
  const now = useNow();
  const bp = state.bellpal!;
  const second = ringPhase(session, now) === 'second';
  const others = session.memberIds.filter((id) => id !== ME);
  const groupStart = session.firstRingAt + GROUP_RING_DELAY_MS;
  const groupRinging = second || now >= groupStart;
  const group = myGroupOf(state);
  const groupName = group?.name ?? 'your group';
  const snoozeLabel = state.fastSnooze ? `${DEMO_SNOOZE_MS / 1000} s` : `${SNOOZE_MS / 60_000} min`;

  return (
    <div className="ring-screen own" role="alertdialog" aria-label="Your alarm is ringing">
      <div className="ring-top">
        <span className="ring-chip">{second ? 'Second ring' : 'Your alarm'}</span>
        <Clock now={now} />
        <p className="ring-date">{longDate(now)}</p>
      </div>
      <div className="ring-pet">
        <BellPalArt species={bp.species} stage={stageForLevel(bp.level)} mood="ringing" />
      </div>
      {others.length > 0 ? (
        <div className={`ring-group${groupRinging ? ' hot' : ''}`}>
          <div className="avatar-stack">
            {others.map((id) => {
              const m = memberView(state, id);
              return m ? <PalAvatar key={id} species={m.species} level={m.level} size={34} mood={groupRinging ? 'ringing' : 'sleepy'} /> : null;
            })}
          </div>
          {groupRinging ? (
            <p>
              <strong>{second ? `Everyone in ${groupName} is ringing` : `${plural(others.length, 'pal')} ringing now`}</strong>
              <br />
              Until you feed {BELLPALS[bp.species].name}.
            </p>
          ) : (
            <>
              <p>
                <strong>{groupName} rings in {formatTimer(groupStart - now)}</strong>
                <br />
                Get up now to spare them.
              </p>
              <div className="countdown">
                <span style={{ width: `${Math.min(100, ((now - session.firstRingAt) / GROUP_RING_DELAY_MS) * 100)}%` }} />
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="ring-solo">Solo alarm. Only your phone is ringing.</p>
      )}
      <div className="ring-actions">
        {canSnooze(session, now) ? (
          <button type="button" className="btn btn-block btn-snooze" onClick={() => dispatch({ type: 'snooze', sessionId: session.id, now: Date.now() })}>
            <Icon name="moon" />
            Snooze {snoozeLabel} (once)
          </button>
        ) : (
          <p className="snooze-used">Snooze used. Time to get up!</p>
        )}
        <SwipeToStop label={`Swipe to feed ${BELLPALS[bp.species].name}`} onDone={onSwiped} />
      </div>
    </div>
  );
}

function FeedingScreen({ onFed }: { onFed: () => void }) {
  const { state } = useStore();
  const bp = state.bellpal!;
  const info = BELLPALS[bp.species];
  const treats = treatsForLevel(bp.level);
  return (
    <div className="ring-screen feeding" role="dialog" aria-label={`Feed ${info.name} to turn off the alarm`}>
      <div className="feed-head">
        <span className="ring-chip">Still ringing</span>
        <h2>Feed {info.name} to turn it off</h2>
        <p>
          Drag {treats === 1 ? `the ${info.treatName}` : `all ${treats} ${info.treatName}s`} into its mouth.
        </p>
      </div>
      <FeedingGame species={bp.species} level={bp.level} onAllFed={onFed} />
    </div>
  );
}

function SnoozedScreen({ session, onHide, onUpNow }: { session: LiveSession; onHide: () => void; onUpNow: () => void }) {
  const { state } = useStore();
  const now = useNow();
  const bp = state.bellpal!;
  const group = myGroupOf(state);
  const others = session.memberIds.length > 1;
  return (
    <div className="ring-screen snoozed" role="dialog" aria-label="Snoozed">
      <div className="ring-pet small">
        <BellPalArt species={bp.species} stage={stageForLevel(bp.level)} mood="sleepy" />
      </div>
      <span className="ring-chip">Snoozed</span>
      <p className="big-timer">{formatTimer((session.secondRingAt ?? now) - now)}</p>
      <p className="ring-copy">
        Rings again at {clockWithSeconds(session.secondRingAt ?? now)}
        {others ? `, on every phone in ${group?.name ?? 'your group'} at the same time.` : '.'} No more snoozes after that.
      </p>
      <div className="ring-actions">
        <Button variant="sun" onClick={onUpNow}>
          I'm up, feed {BELLPALS[bp.species].name} now
        </Button>
        <Button variant="light-ghost" onClick={onHide}>
          Hide
        </Button>
      </div>
    </div>
  );
}

function ResultScreen() {
  const { state, dispatch } = useStore();
  const result = state.lastFeed!;
  const bp = state.bellpal!;
  const stage = stageForLevel(result.level);
  const before = stageForLevel(result.leveledUp ? result.level - 1 : result.level);
  const [revealed, setRevealed] = useState(!result.evolved);

  useEffect(() => {
    if (!result.evolved) return;
    const id = window.setTimeout(() => setRevealed(true), 1700);
    return () => window.clearTimeout(id);
  }, [result.evolved]);

  const name = formName(bp.species, stage);
  let headline = `${name} is full and happy`;
  if (result.evolved) headline = revealed ? `${formName(bp.species, before)} evolved into ${name}!` : 'Oh? Something is happening…';
  else if (result.leveledUp) headline = `Level up! ${name} is now Lv ${result.level}`;

  const need = feedsToLevelUp(result.level);
  return (
    <div className={`ring-screen result${result.evolved && !revealed ? ' evolving' : ''}`} role="dialog" aria-label="Alarm off">
      <span className="ring-chip ok">
        <Icon name="check" />
        Alarm off{result.groupSize > 1 ? ' for everyone' : ''}
      </span>
      <div className="ring-pet">
        <BellPalArt key={revealed ? 'after' : 'before'} species={bp.species} stage={revealed ? stage : before} mood="happy" />
      </div>
      <h2 className="result-title">{headline}</h2>
      {result.level < MAX_LEVEL ? (
        <div className="result-progress">
          <div className="progress light">
            <span style={{ width: `${(result.feeds / need) * 100}%` }} />
          </div>
          <small>
            Lv {result.level} · {result.feeds} of {need} fed mornings to Lv {result.level + 1}
          </small>
        </div>
      ) : (
        <p className="ring-copy">Max level reached.</p>
      )}
      {result.evolved && revealed && <p className="ring-copy">From now on it eats {plural(treatsForLevel(result.level), 'treat')} per alarm.</p>}
      {result.groupSize > 1 && (
        <p className="result-group">
          {result.woke
            ? `Your alarm woke ${plural(result.wokeCount, 'pal')}. Get up within 24 s next time to spare them.`
            : 'You were up before your pals rang. Nice one!'}
        </p>
      )}
      <div className="ring-actions">
        <Button variant="sun" onClick={() => dispatch({ type: 'clearLastFeed' })}>
          Done
        </Button>
      </div>
    </div>
  );
}

function FriendRinging({ session }: { session: LiveSession }) {
  const { state } = useStore();
  const now = useNow();
  const owner = memberView(state, session.ownerId);
  if (!owner) return null;
  const second = ringPhase(session, now) === 'second';
  const startedForMe = second ? session.secondRingAt! : firstRingStartFor(session, ME);
  const pal = formName(owner.species, stageForLevel(owner.level));
  const alsoRinging = session.memberIds
    .filter((id) => id !== session.ownerId && ringStateFor(session, id, now) === 'ringing')
    .sort((a, b) => Number(b === ME) - Number(a === ME));
  const names = alsoRinging.map((id) => (id === ME ? 'You' : firstName(state, id)));
  return (
    <div className="ring-screen friend" role="alertdialog" aria-label={`${owner.firstName}'s alarm is ringing`}>
      <div className="ring-top">
        <span className="ring-chip">{second ? `${owner.firstName}'s second ring` : `${owner.firstName}'s alarm`}</span>
        <Clock now={now} />
      </div>
      <div className="ring-pet">
        <BellPalArt species={owner.species} stage={stageForLevel(owner.level)} mood="sleepy" />
      </div>
      <h2 className="ring-title">{owner.firstName} isn't up yet</h2>
      <p className="ring-copy">
        Your phone keeps ringing until {owner.firstName} feeds {pal}. Only {owner.firstName} can turn it off.
      </p>
      <p className="ring-elapsed">Ringing for {formatTimer(now - startedForMe)}</p>
      <div className="ring-group hot">
        <div className="avatar-stack">
          {alsoRinging.map((id) => {
            const m = memberView(state, id);
            return m ? <PalAvatar key={id} species={m.species} level={m.level} size={34} mood="ringing" /> : null;
          })}
        </div>
        <p>
          <strong>{joinNames(names)} {names.length === 1 && names[0] !== 'You' ? 'is' : 'are'} ringing</strong>
          <br />
          {second ? 'Second ring: everyone started together.' : `Started 24 s after ${owner.firstName}'s alarm.`}
        </p>
      </div>
    </div>
  );
}

function FriendSnoozed({ session, onHide }: { session: LiveSession; onHide: () => void }) {
  const { state } = useStore();
  const now = useNow();
  const name = firstName(state, session.ownerId);
  return (
    <div className="ring-screen snoozed" role="dialog" aria-label={`${name} snoozed`}>
      <span className="ring-chip">{name} snoozed</span>
      <p className="big-timer">{formatTimer((session.secondRingAt ?? now) - now)}</p>
      <p className="ring-copy">Everyone's phone rings again at the same time. {name} can't snooze a second time.</p>
      <div className="ring-actions">
        <Button variant="light-ghost" onClick={onHide}>
          Hide
        </Button>
      </div>
    </div>
  );
}

function FriendUp({ session, onDismiss }: { session: LiveSession; onDismiss: () => void }) {
  const { state } = useStore();
  const owner = memberView(state, session.ownerId);
  if (!owner) return null;
  return (
    <div className="ring-screen result" role="status">
      <span className="ring-chip ok">
        <Icon name="check" />
        Alarm off
      </span>
      <div className="ring-pet">
        <BellPalArt species={owner.species} stage={stageForLevel(owner.level)} mood="happy" />
      </div>
      <h2 className="result-title">{owner.firstName} is up!</h2>
      <p className="ring-copy">{formName(owner.species, stageForLevel(owner.level))} got fed. Your phone is quiet again.</p>
      <div className="ring-actions">
        <Button variant="sun" onClick={onDismiss}>
          OK
        </Button>
      </div>
    </div>
  );
}
