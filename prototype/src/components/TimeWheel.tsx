import { useEffect, useRef, type KeyboardEvent } from 'react';
import { fromClockTime, toClockTime, type ClockTime, type Meridiem } from '../domain/rules';

const ITEM_HEIGHT = 44;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const MERIDIEMS: Meridiem[] = ['AM', 'PM'];

/** Hour, minute and AM/PM wheels, like a phone's alarm picker. */
export function TimeWheel({ value, onChange }: { value: ClockTime; onChange: (time: ClockTime) => void }) {
  const { hour12, minute, meridiem } = fromClockTime(value);
  return (
    <div className="time-wheel">
      <div className="wheel-band" aria-hidden="true" />
      <WheelColumn label="Hour" items={HOURS} index={hour12 - 1} onChange={(i) => onChange(toClockTime(i + 1, minute, meridiem))} />
      <span className="wheel-colon" aria-hidden="true">
        :
      </span>
      <WheelColumn label="Minute" items={MINUTES} index={minute} onChange={(i) => onChange(toClockTime(hour12, i, meridiem))} />
      <WheelColumn label="AM or PM" items={MERIDIEMS} index={meridiem === 'AM' ? 0 : 1} onChange={(i) => onChange(toClockTime(hour12, minute, MERIDIEMS[i]!))} narrow />
    </div>
  );
}

function WheelColumn({
  label,
  items,
  index,
  onChange,
  narrow = false,
}: {
  label: string;
  items: readonly string[];
  index: number;
  onChange: (index: number) => void;
  narrow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);

  // Keep the scroll position in step with the value.
  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ITEM_HEIGHT) > 2) el.scrollTo({ top: index * ITEM_HEIGHT });
  }, [index]);

  const onScroll = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const next = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)));
      if (next !== index) onChange(next);
    }, 110);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.min(items.length - 1, index + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.max(0, index - 1));
    }
  };

  return (
    <div
      ref={ref}
      className={`wheel-col${narrow ? ' narrow' : ''}`}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      role="listbox"
      aria-label={label}
      tabIndex={0}
    >
      <div className="wheel-pad" />
      {items.map((item, i) => (
        <div key={item} role="option" aria-selected={i === index} className={`wheel-item${i === index ? ' sel' : ''}`} onClick={() => onChange(i)}>
          {item}
        </div>
      ))}
      <div className="wheel-pad" />
    </div>
  );
}
