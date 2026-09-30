import { useRef, useState } from 'react';
import { BELLPALS, type Species, type TreatKind } from '../data/bellpals';
import { stageForLevel, treatsForLevel } from '../domain/rules';
import { BellPalArt, mouthPoint, type Mood } from './BellPalArt';
import { TreatArt } from './TreatArt';

interface Mouth {
  x: number;
  y: number;
  reach: number;
}

/** Drag each treat into the BellPal's mouth. Needs 1, 2 or 3 treats depending on level. */
export function FeedingGame({ species, level, onAllFed }: { species: Species; level: number; onAllFed: () => void }) {
  const stage = stageForLevel(level);
  const total = treatsForLevel(level);
  const info = BELLPALS[species];
  const petRef = useRef<HTMLDivElement>(null);
  const eatenRef = useRef(0);
  const [eaten, setEaten] = useState(0);
  const [mood, setMood] = useState<Mood>('hungry');
  const [near, setNear] = useState(false);

  const mouth = (): Mouth => {
    const rect = petRef.current!.getBoundingClientRect();
    const point = mouthPoint(stage);
    return { x: rect.left + rect.width * point.x, y: rect.top + rect.height * point.y, reach: rect.width * 0.2 };
  };

  const eat = () => {
    setMood('chomp');
    eatenRef.current += 1;
    const count = eatenRef.current;
    window.setTimeout(() => {
      setEaten(count);
      if (count >= total) {
        setMood('happy');
        window.setTimeout(onAllFed, 900);
      } else {
        setMood('hungry');
      }
    }, 420);
  };

  const treatWord = total === 1 ? info.treatName : `${info.treatName}s`;
  return (
    <div className="feed-game">
      <div className="feed-pet" ref={petRef}>
        <BellPalArt species={species} stage={stage} mood={near && mood === 'hungry' ? 'open' : mood} />
      </div>
      <p className="feed-count" aria-live="polite">
        {eaten >= total ? 'All fed!' : `${eaten} of ${total} ${treatWord} eaten`}
      </p>
      <div className="feed-tray">
        {Array.from({ length: total }, (_, i) => (
          <DraggableTreat key={i} kind={info.treat} getMouth={mouth} onNear={setNear} onEat={eat} label={`Treat ${i + 1} of ${total}. Drag it to ${info.name}'s mouth, or press Enter.`} />
        ))}
      </div>
    </div>
  );
}

function DraggableTreat({
  kind,
  getMouth,
  onNear,
  onEat,
  label,
}: {
  kind: TreatKind;
  getMouth: () => Mouth;
  onNear: (near: boolean) => void;
  onEat: () => void;
  label: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [gone, setGone] = useState(false);

  const distance = (clientX: number, clientY: number) => {
    const m = getMouth();
    return Math.hypot(clientX - m.x, clientY - m.y) / m.reach;
  };

  const swallow = () => {
    const rect = ref.current!.getBoundingClientRect();
    const m = getMouth();
    setPos((p) => ({ x: p.x + m.x - (rect.left + rect.width / 2), y: p.y + m.y - (rect.top + rect.height / 2) }));
    setGone(true);
    onNear(false);
    onEat();
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`treat${dragging ? ' dragging' : ''}${gone ? ' gone' : ''}`}
      aria-label={label}
      disabled={gone}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${gone ? 0.15 : dragging ? 1.15 : 1})` }}
      onPointerDown={(e) => {
        if (gone) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        grab.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (!grab.current) return;
        setPos({ x: e.clientX - grab.current.dx, y: e.clientY - grab.current.dy });
        onNear(distance(e.clientX, e.clientY) < 2.4);
      }}
      onPointerUp={(e) => {
        if (!grab.current) return;
        grab.current = null;
        setDragging(false);
        if (distance(e.clientX, e.clientY) < 1.5) swallow();
        else {
          onNear(false);
          setPos({ x: 0, y: 0 });
        }
      }}
      onPointerCancel={() => {
        grab.current = null;
        setDragging(false);
        onNear(false);
        setPos({ x: 0, y: 0 });
      }}
      onKeyDown={(e) => {
        if (!gone && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          swallow();
        }
      }}
    >
      <TreatArt kind={kind} />
    </button>
  );
}
