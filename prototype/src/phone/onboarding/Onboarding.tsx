import { useState } from 'react';
import { BellPalArt } from '../../components/BellPalArt';
import { GoogleGlyph, AppleGlyph } from '../../components/Icons';
import { TimeWheel } from '../../components/TimeWheel';
import { Button, DayPicker, StepDots } from '../../components/ui';
import { BELLPALS, SPECIES, type Species } from '../../data/bellpals';
import { STAGE_NAMES, formatClockTime, toClockTime, type Stage, type Weekday } from '../../domain/rules';
import { describeDays } from '../../lib/format';
import { checkUsername } from '../../lib/username';
import { useStore } from '../../state/store';

export function Onboarding() {
  const { state } = useStore();
  if (state.step === 'profile') return <ProfileSetup />;
  if (state.step === 'bellpal') return <ChooseBellPal />;
  return <FirstAlarm />;
}

function ProfileSetup() {
  const { state, dispatch } = useStore();
  const [fullName, setFullName] = useState(state.profile.fullName);
  const [username, setUsername] = useState(state.profile.username);
  const check = checkUsername(username, state.people);
  const canContinue = fullName.trim().length >= 2 && check.ok;

  return (
    <div className="screen onboarding">
      <StepDots step={1} />
      <h1>Set up your profile</h1>
      <p className="lead">This is how your pals find you.</p>
      <label className="field">
        <span>Full name</span>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        <span>Username</span>
        <span className="input-prefix">
          <span aria-hidden="true">@</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            autoCapitalize="none"
            autoComplete="username"
            spellCheck={false}
          />
        </span>
        <small className={check.ok ? 'field-ok' : 'field-err'}>{check.message}</small>
      </label>
      <div className="linked-box">
        <span className="label">Signed in with</span>
        {state.profile.googleEmail ? (
          <div className="linked-row">
            <GoogleGlyph />
            <div>
              <strong>Gmail</strong>
              <small>{state.profile.googleEmail}</small>
            </div>
          </div>
        ) : (
          <div className="linked-row">
            <AppleGlyph />
            <div>
              <strong>Apple ID</strong>
              <small>Email hidden with Hide My Email</small>
            </div>
          </div>
        )}
      </div>
      <div className="grow" />
      <Button onClick={() => dispatch({ type: 'saveProfile', fullName: fullName.trim(), username })} disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );
}

const LEVEL_RANGES: Record<Stage, string> = { 1: 'Lv 1–5', 2: 'Lv 6–10', 3: 'Lv 11–15' };

function ChooseBellPal() {
  const { state, dispatch } = useStore();
  const [species, setSpecies] = useState<Species>(state.bellpal?.species ?? 'ding');
  const info = BELLPALS[species];

  return (
    <div className="screen onboarding choose">
      <StepDots step={2} />
      <h1>Pick your BellPal</h1>
      <p className="lead">Feed it to turn off your alarm each morning. It levels up and evolves as you go.</p>
      <div className="choose-hero">
        <div className="choose-art">
          <BellPalArt key={species} species={species} stage={1} mood="happy" />
        </div>
        <div className="choose-name">
          <strong>{info.name}</strong>
          <span>{info.blurb}</span>
        </div>
      </div>
      <div className="evo-path" aria-label={`${info.name} evolves at level 6 and level 11`}>
        {([1, 2, 3] as Stage[]).map((stage) => (
          <div key={stage} className="evo">
            <BellPalArt species={species} stage={stage} silhouette={stage > 1} label={stage > 1 ? 'Locked evolution' : undefined} />
            <span>
              {STAGE_NAMES[stage]}
              <small>{LEVEL_RANGES[stage]}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="choose-grid" role="radiogroup" aria-label="BellPals">
        {SPECIES.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={s === species} className={`choose-card${s === species ? ' on' : ''}`} onClick={() => setSpecies(s)}>
            <BellPalArt species={s} stage={1} label="" />
            <span>{BELLPALS[s].name}</span>
          </button>
        ))}
      </div>
      <Button onClick={() => dispatch({ type: 'chooseBellPal', species })}>Choose {info.name}</Button>
    </div>
  );
}

function FirstAlarm() {
  const { dispatch } = useStore();
  const [time, setTime] = useState(toClockTime(7, 0, 'AM'));
  const [days, setDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);

  return (
    <div className="screen onboarding">
      <StepDots step={3} />
      <h1>Set your first alarm</h1>
      <p className="lead">One alarm per day. You can change it any time.</p>
      <TimeWheel value={time} onChange={setTime} />
      <DayPicker value={days} onChange={setDays} />
      <p className="summary">{days.length ? `${describeDays(days)} at ${formatClockTime(time)}` : 'Pick at least one day.'}</p>
      <div className="grow" />
      <Button onClick={() => dispatch({ type: 'finishOnboarding', days, time })} disabled={days.length === 0}>
        Save alarm
      </Button>
      <Button variant="ghost" onClick={() => dispatch({ type: 'finishOnboarding', days: [], time: null })}>
        Skip for now
      </Button>
    </div>
  );
}
