import { useEffect, useState } from 'react';
import { BellPalArt, type Mood } from '../../components/BellPalArt';
import { AppleGlyph, GoogleGlyph, Icon } from '../../components/Icons';
import { SPECIES } from '../../data/bellpals';
import { useStore } from '../../state/store';
import { LogoMark } from '../Logo';

// The pals on the welcome picture take turns: one rings, the others react.
const LINEUP: Mood[][] = [
  ['idle', 'ringing', 'idle', 'sleepy'],
  ['happy', 'idle', 'ringing', 'idle'],
  ['idle', 'happy', 'idle', 'ringing'],
  ['ringing', 'idle', 'happy', 'idle'],
];

export function Welcome() {
  const { dispatch } = useStore();
  const [pending, setPending] = useState<'google' | 'apple' | null>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const id = window.setTimeout(() => dispatch({ type: 'signIn', provider: pending }), 900);
    return () => window.clearTimeout(id);
  }, [pending, dispatch]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setBeat((b) => (b + 1) % LINEUP.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="screen welcome">
      <div className="logo">
        <LogoMark />
        BellPals
      </div>
      <div className="welcome-photo">
        <div className="glass-note">
          <span className="clay-tile">
            <Icon name="alarm" />
          </span>
          <span>
            <strong>Your alarm · 7:00 AM</strong>
            <small>Pals ring in 0:24 if you sleep in</small>
          </span>
        </div>
        <div className="parade" aria-hidden="true">
          {SPECIES.map((species, i) => (
            <div key={species} className="parade-item">
              <BellPalArt species={species} stage={1} mood={LINEUP[beat]![i]!} label="" />
            </div>
          ))}
        </div>
      </div>
      <div className="welcome-copy">
        <h1>Wake up together</h1>
        <p>Your alarm rings. Not up in 24 seconds? Your pals' phones ring too, until you feed your BellPal.</p>
      </div>
      <div className="welcome-actions">
        <button type="button" className="btn btn-block btn-apple" onClick={() => setPending('apple')} disabled={pending !== null}>
          <AppleGlyph />
          Continue with Apple
        </button>
        <button type="button" className="btn btn-block btn-google" onClick={() => setPending('google')} disabled={pending !== null}>
          <GoogleGlyph />
          Continue with Google
        </button>
        <p className="fineprint">Prototype: sign-in is simulated and no account is created.</p>
      </div>
      {pending && (
        <div className="signing-in" role="status">
          <span className="spinner" />
          Signing in with {pending === 'apple' ? 'Apple' : 'Google'}…
        </div>
      )}
    </div>
  );
}
