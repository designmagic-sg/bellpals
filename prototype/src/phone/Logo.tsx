export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`logo-mark ${className}`} aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#2A2344" />
      <path d="M24 9.5c-6.1 0-10.2 4.6-10.2 10.6V28l-3.3 4.3h27L34.2 28v-7.9C34.2 14.1 30.1 9.5 24 9.5z" fill="#FFC94A" />
      <circle cx="19.5" cy="21" r="1.9" fill="#2A2344" />
      <circle cx="28.5" cy="21" r="1.9" fill="#2A2344" />
      <path d="M21 25.2 Q24 27.6 27 25.2" stroke="#2A2344" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="36.6" r="3.1" fill="#FF7A59" />
    </svg>
  );
}
