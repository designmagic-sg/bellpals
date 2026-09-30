import { useRef, useState } from 'react';
import { Icon } from './Icons';

const KNOB = 60;
const PAD = 6;

/** Drag the knob all the way to the right to continue. */
export function SwipeToStop({ label, onDone }: { label: string; onDone: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<{ pointerX: number; base: number } | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const max = () => Math.max(0, (track.current?.clientWidth ?? 300) - KNOB - PAD * 2);

  const finish = () => {
    setX(max());
    setDone(true);
    window.setTimeout(onDone, 180);
  };

  return (
    <div className={`swipe${done ? ' done' : ''}`} ref={track}>
      <div className="swipe-fill" style={{ width: x + KNOB + PAD }} />
      <span className="swipe-label" style={{ opacity: Math.max(0, 1 - x / 140) }}>
        {label}
      </span>
      <button
        type="button"
        className="swipe-knob"
        aria-label={`${label}. Press Enter to continue.`}
        style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : 'transform 0.25s ease' }}
        onPointerDown={(e) => {
          if (done) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = { pointerX: e.clientX, base: x };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          setX(Math.min(max(), Math.max(0, start.current.base + e.clientX - start.current.pointerX)));
        }}
        onPointerUp={() => {
          if (!start.current) return;
          start.current = null;
          setDragging(false);
          if (x >= max() * 0.82) finish();
          else setX(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDragging(false);
          setX(0);
        }}
        onKeyDown={(e) => {
          if (!done && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            finish();
          }
        }}
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
