import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { BELLPALS, type Species } from '../data/bellpals';
import { WEEKDAYS, WEEKDAY_LETTER, WEEKDAY_NAMES, stageForLevel, type Weekday } from '../domain/rules';
import { WHITE, mix } from '../lib/color';
import { BellPalArt, type Mood } from './BellPalArt';
import { Icon } from './Icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'sun' | 'light-ghost';

export function Button({
  variant = 'primary',
  small = false,
  block = true,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean; block?: boolean }) {
  return (
    <button type="button" className={`btn btn-${variant}${small ? ' btn-small' : ''}${block ? ' btn-block' : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; badge?: number }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
          {o.badge ? <span className="badge">{o.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function PalAvatar({
  species,
  level,
  size = 44,
  mood = 'idle',
  className = '',
}: {
  species: Species;
  level: number;
  size?: number;
  mood?: Mood;
  className?: string;
}) {
  const style = { width: size, height: size, '--tint': mix(BELLPALS[species].body, WHITE, 0.62) } as CSSProperties;
  return (
    <span className={`pal-avatar ${className}`} style={style}>
      <BellPalArt species={species} stage={stageForLevel(level)} mood={mood} label="" tight />
    </span>
  );
}

export function DayPicker({ value, onChange }: { value: Weekday[]; onChange: (days: Weekday[]) => void }) {
  const toggle = (day: Weekday) => onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));
  return (
    <div className="day-picker" role="group" aria-label="Days">
      {WEEKDAYS.map((day) => (
        <button key={day} type="button" aria-pressed={value.includes(day)} aria-label={WEEKDAY_NAMES[day]} className={value.includes(day) ? 'on' : ''} onClick={() => toggle(day)}>
          {WEEKDAY_LETTER[day]}
        </button>
      ))}
    </div>
  );
}

export function StepDots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="step-dots" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < step ? 'on' : ''} />
      ))}
    </div>
  );
}

export function Chip({ tone = 'plain', children }: { tone?: 'plain' | 'ok' | 'warn' | 'muted'; children: ReactNode }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
