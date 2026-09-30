import { useEffect, useState } from 'react';
import { BellPalArt } from '../../components/BellPalArt';
import { AppleGlyph, GoogleGlyph } from '../../components/Icons';
import { SPECIES } from '../../data/bellpals';
import { useStore } from '../../state/store';
import { LogoMark } from '../Logo';

export function Welcome() {
  const { dispatch } = useStore();
  const [pending, setPending] = useState<'google' | 'apple' | null>(null);

  useEffect(() => {
    if (!pending) return;
    const id = window.setTimeout(() => dispatch({ type: 'signIn', provider: pending }), 900);
    return () => window.clearTimeout(id);
  }, [pending, dispatch]);

  return (
    <div className="screen welcome">
      <div className="welcome-hero">
        <div className="logo">
          <LogoMark />
          BellPals
        </div>
        <div className="parade" aria-hidden="true">
          {SPECIES.map((species, i) => (
            <div key={species} className="parade-item" style={{ animationDelay: `${i * 0.18}s` }}>
              <BellPalArt species={species} stage={1} mood={i === 2 ? 'happy' : 'idle'} label="" />
            </div>
          ))}
        </div>
        <h1>Wake up with your pals.</h1>
        <p>Set your alarm. If you're still in bed 24 seconds after it rings, your whole group's phones start ringing too.</p>
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
