import { useId } from 'react';

/** App icon: a white bell on a coral clay tile. */
export function LogoMark({ className = '' }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 48 48" className={`logo-mark ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9603A" />
          <stop offset="1" stopColor="#C23517" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#lg${id})`} />
      <rect x="1" y="1" width="46" height="23" rx="13" fill="#FFFFFF" opacity="0.12" />
      <path
        d="M14.5 31.5V22a9.5 9.5 0 0 1 19 0v9.5l2.6 3.3H11.9z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M21 38.5a3.2 3.2 0 0 0 6 0" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
