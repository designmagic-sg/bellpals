import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BELLPALS, type Species } from '../data/bellpals';
import type { Stage } from '../domain/rules';
import { BellPalArt, type Action, type Mood } from './BellPalArt';

/**
 * The BellPal's little room on Home, like a virtual pet screen: by day it
 * wanders about, sits and turns around on its own; at night it sleeps.
 */
export function PetRoom({
  species,
  stage,
  night,
  mood,
  onPet,
  label,
  children,
}: {
  species: Species;
  stage: Stage;
  night: boolean;
  /** Set by the parent for a moment after a tap. */
  mood: Mood;
  onPet: () => void;
  label: string;
  children?: ReactNode;
}) {
  const [x, setX] = useState(0.5);
  const xRef = useRef(0.5);
  const [action, setAction] = useState<Action | null>(null);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [moveMs, setMoveMs] = useState(0);
  const roaming = !night && mood === 'idle';

  useEffect(() => {
    // A tap or nightfall stops whatever it was doing (a walk in progress glides to its end).
    setAction(null);
    if (!roaming || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const later = (fn: () => void, ms: number) => {
      timer = window.setTimeout(fn, ms);
    };
    const rest = (min: number, spread: number) => later(plan, min + Math.random() * spread);
    const plan = () => {
      const roll = Math.random();
      const hasPoses = species === 'ding';
      if (roll < 0.5) {
        const from = xRef.current;
        let to = 0.18 + Math.random() * 0.64;
        if (Math.abs(to - from) < 0.12) to = from < 0.5 ? from + 0.25 : from - 0.25;
        const ms = Math.round(Math.abs(to - from) * 5600);
        xRef.current = to;
        setFacing(to < from ? 'left' : 'right');
        setMoveMs(ms);
        setAction('walk');
        setX(to);
        later(() => {
          setAction(null);
          setMoveMs(0);
          rest(1300, 1800);
        }, ms);
      } else if (roll < 0.64 && hasPoses) {
        setAction('sit');
        later(() => {
          setAction(null);
          rest(800, 900);
        }, 2400 + Math.random() * 1600);
      } else if (roll < 0.76 && hasPoses) {
        setAction('spin');
        later(() => {
          setAction(null);
          rest(1000, 1200);
        }, 720);
      } else if (roll < 0.9) {
        setFacing((f) => (f === 'left' ? 'right' : 'left'));
        rest(1100, 1300);
      } else {
        rest(1500, 2200);
      }
    };
    later(plan, 900);
    return () => window.clearTimeout(timer);
  }, [roaming, species]);

  const tint = BELLPALS[species].tint;
  const style = {
    '--room-light': tint[0],
    '--room-deep': tint[1],
  } as CSSProperties;
  const steps = Math.max(1, Math.round(moveMs / 110));

  return (
    <div className={`pet-room${night ? ' night' : ''}`} style={style}>
      {night && (
        <span className="room-sky" aria-hidden="true">
          <i className="moon" />
          <i style={{ left: '14%', top: '30%' }} />
          <i style={{ left: '70%', top: '46%' }} />
          <i style={{ left: '88%', top: '62%' }} />
          <i style={{ left: '34%', top: '14%' }} />
        </span>
      )}
      <span className="room-floor" aria-hidden="true" />
      <button
        type="button"
        className="room-pet"
        onClick={onPet}
        aria-label={label}
        style={{ left: `${x * 100}%`, transition: moveMs ? `left ${moveMs}ms steps(${steps})` : 'none' }}
      >
        <BellPalArt species={species} stage={stage} mood={night && mood === 'idle' ? 'sleepy' : mood} action={action} facing={facing} label="" />
      </button>
      {children}
    </div>
  );
}
