// Small line icons (24 × 24, currentColor).
const PATHS = {
  home: 'M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z',
  alarm: 'M12 21 A8 8 0 1 0 12 5 A8 8 0 1 0 12 21 Z M12 9 V13 L14.5 15 M4 5 L7 2.5 M20 5 L17 2.5',
  pals: 'M9 11 A3.2 3.2 0 1 0 9 4.6 A3.2 3.2 0 1 0 9 11 Z M3 20 C3.6 16.6 6 14.5 9 14.5 C12 14.5 14.4 16.6 15 20 M16.5 11.2 A2.6 2.6 0 1 0 16.5 6 M17.2 14.6 C19.4 14.9 20.6 16.6 21 19.5',
  user: 'M12 11.5 A3.8 3.8 0 1 0 12 3.9 A3.8 3.8 0 1 0 12 11.5 Z M4.5 20.5 C5.3 16.5 8.3 14.2 12 14.2 C15.7 14.2 18.7 16.5 19.5 20.5',
  plus: 'M12 5 V19 M5 12 H19',
  check: 'M5 12.5 L9.5 17 L19 7',
  x: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5',
  chevronRight: 'M9 5 L16 12 L9 19',
  chevronLeft: 'M15 5 L8 12 L15 19',
  crown: 'M4 17 L3 7 L8.5 11 L12 5 L15.5 11 L21 7 L20 17 Z M5 20 H19',
  trash: 'M5 7 H19 M10 7 V4.5 H14 V7 M7 7 L8 20 H16 L17 7',
  logout: 'M10 5 H5 V19 H10 M14 8 L18 12 L14 16 M18 12 H9',
  link: 'M10 14 L14 10 M8.5 11.5 L6.5 13.5 A3.5 3.5 0 0 0 11.5 18.5 L13.5 16.5 M15.5 12.5 L17.5 10.5 A3.5 3.5 0 0 0 12.5 5.5 L10.5 7.5',
  search: 'M11 18 A7 7 0 1 0 11 4 A7 7 0 1 0 11 18 Z M16 16 L20.5 20.5',
  book: 'M5 4 H17 A2 2 0 0 1 19 6 V20 H7 A2 2 0 0 1 5 18 Z M9 9 H15 M9 13 H13',
  moon: 'M19.5 14.5 A8 8 0 1 1 9.5 4.5 A6.5 6.5 0 0 0 19.5 14.5 Z',
  bell: 'M6 16.5 V11 A6 6 0 0 1 18 11 V16.5 L19.6 18.5 H4.4 Z M10 21 A2 2 0 0 0 14 21',
  info: 'M12 21 A9 9 0 1 0 12 3 A9 9 0 1 0 12 21 Z M12 11 V16.5 M12 7.5 V7.6',
  share: 'M12 15 V4 M8 8 L12 4 L16 8 M6 12 V20 H18 V12',
  sparkle: 'M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z',
  volume: 'M4 10 V14 H8 L13 18 V6 L8 10 Z M16.5 9 A4.5 4.5 0 0 1 16.5 15',
  mute: 'M4 10 V14 H8 L13 18 V6 L8 10 Z M17 9.5 L21 14.5 M21 9.5 L17 14.5',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = '', title }: { name: IconName; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`icon ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Simplified glyphs for the sign-in buttons (prototype only). */
export function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true" fill="currentColor">
      <path d="M16.6 12.7c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.9-.8-3.1-.8c-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8s1.8.8 3.1.8 2.1-1.2 2.9-2.4c.9-1.3 1.3-2.6 1.3-2.7 0 0-2.7-1-2.7-4zM14.3 5.6c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
    </svg>
  );
}

export function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12.2 11.2 H17 C17 14.6 14.9 16.8 12 16.8 A4.8 4.8 0 1 1 15.3 8.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
