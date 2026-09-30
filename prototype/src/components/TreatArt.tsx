import type { TreatKind } from '../data/bellpals';

const SEEDS = [
  [22, 22], [30, 18], [38, 22], [18, 30], [26, 29], [34, 29], [42, 31],
  [22, 38], [30, 37], [38, 39], [28, 45], [35, 45],
];

export function TreatArt({ kind, className = '' }: { kind: TreatKind; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`treat-art ${className}`} aria-hidden="true">
      {kind === 'cookie' && (
        <g>
          <circle cx="30" cy="30" r="23" fill="#E7A95E" stroke="#9A5B24" strokeWidth="3" />
          <circle cx="30" cy="30" r="16" fill="#F4C889" />
          <path d="M19 28 Q30 20 41 28" stroke="#F9A826" strokeWidth="4" fill="none" strokeLinecap="round" />
          {[[22, 22], [37, 21], [30, 35], [41, 37], [20, 38]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2.8" fill="#6B3A17" />
          ))}
        </g>
      )}
      {kind === 'fish' && (
        <g stroke="#A8641D" strokeWidth="3" strokeLinejoin="round">
          <path d="M40 30 L55 18 L55 42 Z" fill="#F0A64A" />
          <ellipse cx="25" cy="30" rx="19" ry="13" fill="#F6B85C" />
          <path d="M26 21 Q31 30 26 39" fill="none" strokeWidth="2" />
          <path d="M33 22 Q38 30 33 38" fill="none" strokeWidth="2" />
          <circle cx="15" cy="27" r="2.6" fill="#3B2412" stroke="none" />
        </g>
      )}
      {kind === 'bolt' && (
        <g>
          <circle cx="30" cy="30" r="25" fill="#FFF3C4" />
          <path d="M34 6 L13 34 L27 34 L23 55 L47 24 L33 24 Z" fill="#FFD166" stroke="#C88A00" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {kind === 'carrot' && (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 19 L21 6 M30 19 L30 3 M30 19 L39 6" stroke="#2FA878" strokeWidth="4.5" />
          <path d="M13 24 Q30 15 47 24 L32 55 Q30 58 28 55 Z" fill="#FF9A3C" stroke="#B8581A" strokeWidth="3" />
          <path d="M22 31 L29 31 M26 40 L33 40 M30 48 L34 48" stroke="#B8581A" strokeWidth="2.5" />
        </g>
      )}
      {kind === 'dragonfruit' && (
        <g>
          <circle cx="30" cy="30" r="24" fill="#FF3D8B" stroke="#A3175A" strokeWidth="3" />
          <circle cx="30" cy="31" r="18" fill="#FFF5F8" />
          {SEEDS.map(([x, y]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.4" ry="1.9" fill="#2A2344" />
          ))}
        </g>
      )}
    </svg>
  );
}
