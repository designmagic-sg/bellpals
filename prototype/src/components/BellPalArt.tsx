import { useId, type ReactNode } from 'react';
import { BELLPALS, formName, type Species } from '../data/bellpals';
import type { Stage } from '../domain/rules';
import { INK, WHITE, mix } from '../lib/color';

export type Mood = 'idle' | 'sleepy' | 'ringing' | 'hungry' | 'open' | 'chomp' | 'happy';

const SCALE: Record<Stage, number> = { 1: 0.8, 2: 0.9, 3: 1 };
const ANCHOR_Y = 170;
const MOUTH_Y = 124;
const BODY = 'M54 152 C59 144 61 133 61 118 C61 79 77 50 100 50 C123 50 139 79 139 118 C139 133 141 144 146 152 Z';
const GOLD = '#FFD84D';
const MOUTH = '#5B2333';
const TONGUE = '#FF7A8A';

/** Where the mouth sits, as fractions of the art's width and height (used by the feeding game). */
export function mouthPoint(stage: Stage): { x: number; y: number } {
  return { x: 0.5, y: (ANCHOR_Y + (MOUTH_Y - ANCHOR_Y) * SCALE[stage]) / 200 };
}

interface Palette {
  body: string;
  light: string;
  shade: string;
  outline: string;
  accent: string;
  cheek: string;
}

interface Props {
  species: Species;
  stage: Stage;
  mood?: Mood;
  /** Dark outline only, for evolutions that aren't unlocked yet. */
  silhouette?: boolean;
  className?: string;
  label?: string;
  /** Crop to the character (for small round avatars). */
  tight?: boolean;
}

export function BellPalArt({ species, stage, mood = 'idle', silhouette = false, className = '', label, tight = false }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const info = BELLPALS[species];
  const base = stage === 1 ? mix(info.body, WHITE, 0.16) : info.body;
  const p: Palette = silhouette
    ? { body: INK, light: INK, shade: INK, outline: INK, accent: INK, cheek: INK }
    : {
        body: base,
        light: mix(base, WHITE, 0.45),
        shade: mix(base, INK, 0.16),
        outline: mix(base, INK, 0.62),
        accent: info.accent,
        cheek: info.cheek,
      };
  const scale = SCALE[stage];
  const { behind, front } = features(species, stage, p, silhouette);
  const viewBox = tight ? `${100 - 72 * scale} ${ANCHOR_Y - 136 * scale} ${144 * scale} ${148 * scale}` : '0 0 200 200';

  // An empty label marks the art as decorative (the name is shown as text nearby).
  const decorative = label === '';
  return (
    <svg
      viewBox={viewBox}
      className={`bp bp-${mood}${silhouette ? ' bp-silhouette' : ''} ${className}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? formName(species, stage))}
    >
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.55" stopColor={p.body} />
          <stop offset="1" stopColor={p.shade} />
        </linearGradient>
        <radialGradient id={`g${uid}`}>
          <stop offset="0" stopColor={info.accent} stopOpacity="0.5" />
          <stop offset="1" stopColor={info.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="bp-ground" cx="100" cy="183" rx={40 * scale + 6} ry="7" />
      <g className="bp-float">
        <g transform={`translate(100 ${ANCHOR_Y}) scale(${scale}) translate(-100 -${ANCHOR_Y})`}>
          <g className="bp-shake">
            {stage === 3 && !silhouette && <circle cx="100" cy="108" r="94" fill={`url(#g${uid})`} />}
            {behind}
            <path d={BODY} fill={silhouette ? INK : `url(#b${uid})`} stroke={p.outline} strokeWidth="3.5" strokeLinejoin="round" />
            {!silhouette && (
              <path d="M77 98 C77 80 85 67 96 61" stroke={WHITE} strokeOpacity="0.55" strokeWidth="7" fill="none" strokeLinecap="round" />
            )}
            <rect x="44" y="145" width="112" height="16" rx="8" fill={p.shade} stroke={p.outline} strokeWidth="3.5" />
            <circle cx="100" cy="169" r="8" fill={p.shade} stroke={p.outline} strokeWidth="3.5" />
            {front}
            {!silhouette && <Face mood={mood} p={p} visor={species === 'buzz' && stage === 3} />}
          </g>
        </g>
      </g>
      {mood === 'sleepy' && !silhouette && (
        <g className="bp-zzz" fill={INK} fontFamily="Fredoka, Nunito, sans-serif" fontWeight="700">
          <text x="140" y="62" fontSize="20">z</text>
          <text x="155" y="45" fontSize="15">z</text>
          <text x="167" y="31" fontSize="11">z</text>
        </g>
      )}
    </svg>
  );
}

function star(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

function Face({ mood, p, visor }: { mood: Mood; p: Palette; visor: boolean }) {
  let eyes: ReactNode;
  if (visor) {
    eyes = (
      <g>
        <rect x="68" y="92" width="64" height="24" rx="12" fill={INK} />
        {mood === 'sleepy' || mood === 'happy' || mood === 'chomp' ? (
          <g stroke="#7CF3FF" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d={mood === 'sleepy' ? 'M78 103 Q85 108 92 103' : 'M78 106 Q85 99 92 106'} />
            <path d={mood === 'sleepy' ? 'M108 103 Q115 108 122 103' : 'M108 106 Q115 99 122 106'} />
          </g>
        ) : (
          <g className="bp-eyes" fill="#7CF3FF">
            <rect x="77" y="98" width="16" height="12" rx="6" />
            <rect x="107" y="98" width="16" height="12" rx="6" />
          </g>
        )}
      </g>
    );
  } else if (mood === 'sleepy') {
    eyes = (
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M78 104 Q85 110 92 104" />
        <path d="M108 104 Q115 110 122 104" />
      </g>
    );
  } else if (mood === 'happy' || mood === 'chomp') {
    eyes = (
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M78 106 Q85 98 92 106" />
        <path d="M108 106 Q115 98 122 106" />
      </g>
    );
  } else if (mood === 'ringing') {
    eyes = (
      <g>
        <circle cx="85" cy="103" r="8.5" fill={WHITE} stroke={INK} strokeWidth="3" />
        <circle cx="115" cy="103" r="8.5" fill={WHITE} stroke={INK} strokeWidth="3" />
        <circle cx="85" cy="104" r="3.2" fill={INK} />
        <circle cx="115" cy="104" r="3.2" fill={INK} />
      </g>
    );
  } else {
    const big = mood === 'hungry' || mood === 'open';
    eyes = (
      <g className="bp-eyes">
        <ellipse cx="85" cy="104" rx={big ? 7.5 : 6.5} ry={big ? 9 : 8} fill={INK} />
        <ellipse cx="115" cy="104" rx={big ? 7.5 : 6.5} ry={big ? 9 : 8} fill={INK} />
        <circle cx="87.5" cy="100" r={big ? 3 : 2.4} fill={WHITE} />
        <circle cx="117.5" cy="100" r={big ? 3 : 2.4} fill={WHITE} />
      </g>
    );
  }

  let mouth: ReactNode;
  switch (mood) {
    case 'sleepy':
      mouth = <ellipse cx="100" cy="125" rx="3.5" ry="4" fill={INK} />;
      break;
    case 'ringing':
      mouth = <ellipse cx="100" cy="126" rx="7" ry="6" fill={MOUTH} />;
      break;
    case 'hungry':
      mouth = (
        <g>
          <ellipse cx="100" cy="125" rx="8.5" ry="7.5" fill={MOUTH} />
          <ellipse cx="100" cy="129.5" rx="5" ry="2.8" fill={TONGUE} />
        </g>
      );
      break;
    case 'open':
      mouth = (
        <g>
          <ellipse cx="100" cy="126" rx="12.5" ry="11.5" fill={MOUTH} />
          <ellipse cx="100" cy="132" rx="7" ry="3.8" fill={TONGUE} />
        </g>
      );
      break;
    case 'chomp':
      mouth = (
        <path d="M89 124 L94.5 119.5 L100 124 L105.5 119.5 L111 124" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      );
      break;
    case 'happy':
      mouth = (
        <g>
          <path d="M88 119 Q100 137 112 119 Z" fill={MOUTH} />
          <path d="M93 128.5 Q100 134 107 128.5 Q100 124.5 93 128.5 Z" fill={TONGUE} />
        </g>
      );
      break;
    default:
      mouth = <path d="M92 121 Q100 129 108 121" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  }

  return (
    <g>
      {eyes}
      <ellipse cx="71" cy="120" rx="7.5" ry="4.5" fill={p.cheek} opacity="0.75" />
      <ellipse cx="129" cy="120" rx="7.5" ry="4.5" fill={p.cheek} opacity="0.75" />
      {mouth}
    </g>
  );
}

function features(species: Species, stage: Stage, p: Palette, silhouette: boolean): { behind: ReactNode; front: ReactNode } {
  const line = { stroke: p.outline, strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  const gold = silhouette ? INK : GOLD;
  const sparkles =
    stage === 3 && !silhouette ? (
      <g fill={GOLD} stroke={p.outline} strokeWidth="1.5">
        {[
          [30, 66, 9],
          [170, 50, 11],
          [174, 130, 7],
          [26, 136, 7],
        ].map(([x, y, r]) => (
          <path key={`${x}-${y}`} className="bp-sparkle" d={star(x, y, r)} />
        ))}
      </g>
    ) : null;

  switch (species) {
    case 'ding': {
      const handle = stage < 3 ? <circle cx="100" cy="42" r="9.5" fill="none" stroke={p.outline} strokeWidth="6" /> : null;
      const bow =
        stage >= 2 ? (
          <g {...line} fill={p.accent}>
            <path d="M100 153 L82 145 L82 161 Z" />
            <path d="M100 153 L118 145 L118 161 Z" />
            <circle cx="100" cy="153" r="4.5" />
          </g>
        ) : null;
      const crown =
        stage === 3 ? (
          <g>
            <path d="M74 60 L80 31 L91 46 L100 25 L109 46 L120 31 L126 60 Z" fill={gold} {...line} />
            <circle cx="100" cy="38" r="3.5" fill={p.accent} />
          </g>
        ) : null;
      return { behind: handle, front: <>{bow}{crown}{sparkles}</> };
    }
    case 'chime': {
      const small = stage === 1;
      const ears = (
        <g>
          <path d={small ? 'M66 84 L70 44 L96 60 Z' : 'M62 88 L63 32 L98 58 Z'} fill={p.body} {...line} />
          <path d={small ? 'M134 84 L130 44 L104 60 Z' : 'M138 88 L137 32 L102 58 Z'} fill={p.body} {...line} />
          <path d={small ? 'M72 73 L74 55 L87 62 Z' : 'M69 76 L69 46 L89 60 Z'} fill={p.cheek} />
          <path d={small ? 'M128 73 L126 55 L113 62 Z' : 'M131 76 L131 46 L111 60 Z'} fill={p.cheek} />
        </g>
      );
      const tail =
        stage >= 2 ? (
          <g fill="none" strokeLinecap="round">
            <path d="M136 142 C168 144 172 108 154 100" stroke={p.outline} strokeWidth="15" />
            <path d="M136 142 C168 144 172 108 154 100" stroke={p.body} strokeWidth="8" />
          </g>
        ) : null;
      const whiskers = (
        <g stroke={p.outline} strokeWidth="2.5" strokeLinecap="round">
          <path d="M62 115 L44 111" />
          <path d="M62 122 L44 124" />
          <path d="M138 115 L156 111" />
          <path d="M138 122 L156 124" />
        </g>
      );
      const mega =
        stage === 3 ? (
          <g>
            <circle cx="100" cy="155" r="6.5" fill={gold} {...line} />
            <path d={star(100, 76, 8)} fill={gold} stroke={p.outline} strokeWidth="1.5" />
          </g>
        ) : null;
      return { behind: <>{tail}{ears}</>, front: <>{whiskers}{mega}{sparkles}</> };
    }
    case 'buzz': {
      const antennae =
        stage === 1 ? (
          <g>
            <path d="M100 52 L100 28" stroke={p.outline} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        ) : (
          <g stroke={p.outline} strokeWidth="4.5" strokeLinecap="round">
            <path d="M90 54 L80 29" />
            <path d="M110 54 L120 29" />
          </g>
        );
      const balls =
        stage === 1 ? (
          <circle cx="100" cy="23" r="7.5" fill={p.accent} {...line} />
        ) : (
          <g fill={p.accent} {...line}>
            <circle cx="78" cy="24" r="7.5" />
            <circle cx="122" cy="24" r="7.5" />
          </g>
        );
      const light = stage >= 2 ? <circle cx="100" cy="139" r="3.8" fill={p.accent} stroke={p.outline} strokeWidth="2" /> : null;
      const bolts =
        stage === 3 ? (
          <g fill={p.shade} {...line}>
            <circle cx="61" cy="120" r="5.5" />
            <circle cx="139" cy="120" r="5.5" />
          </g>
        ) : null;
      return { behind: antennae, front: <>{balls}{light}{bolts}{sparkles}</> };
    }
    case 'jingle': {
      const ry = stage === 1 ? 22 : 29;
      const cy = stage === 1 ? 40 : 33;
      const ears = (
        <g>
          <ellipse cx="84" cy={cy} rx="10.5" ry={ry} transform={`rotate(-14 84 ${cy})`} fill={p.body} {...line} />
          <ellipse cx="116" cy={cy} rx="10.5" ry={ry} transform={`rotate(14 116 ${cy})`} fill={p.body} {...line} />
          <ellipse cx="84" cy={cy + 2} rx="4.5" ry={ry - 9} transform={`rotate(-14 84 ${cy})`} fill={p.cheek} />
          <ellipse cx="116" cy={cy + 2} rx="4.5" ry={ry - 9} transform={`rotate(14 116 ${cy})`} fill={p.cheek} />
        </g>
      );
      const flower =
        stage === 2 ? (
          <g>
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle key={deg} cx={126 + 6 * Math.cos((deg * Math.PI) / 180)} cy={62 + 6 * Math.sin((deg * Math.PI) / 180)} r="4.6" fill={silhouette ? INK : WHITE} stroke={p.outline} strokeWidth="1.5" />
            ))}
            <circle cx="126" cy="62" r="3.6" fill={gold} />
          </g>
        ) : null;
      const bow =
        stage === 3 ? (
          <g {...line} fill={p.accent}>
            <path d="M100 58 L85 50 L85 66 Z" />
            <path d="M100 58 L115 50 L115 66 Z" />
            <circle cx="100" cy="58" r="4.5" />
          </g>
        ) : null;
      return { behind: ears, front: <>{flower}{bow}{sparkles}</> };
    }
    case 'gong': {
      const big = stage >= 2;
      const horns = (
        <g fill={silhouette ? INK : '#FFE3B3'} {...line}>
          <path d={big ? 'M78 64 C66 52 64 36 72 22 C78 38 86 50 94 56 Z' : 'M80 62 C71 52 70 40 77 30 C80 43 87 52 93 56 Z'} />
          <path d={big ? 'M122 64 C134 52 136 36 128 22 C122 38 114 50 106 56 Z' : 'M120 62 C129 52 130 40 123 30 C120 43 113 52 107 56 Z'} />
        </g>
      );
      const spikes = big ? (
        <g fill={p.accent} {...line}>
          <path d="M63 88 L47 94 L62 102 Z" />
          <path d="M61 108 L45 114 L61 122 Z" />
          <path d="M137 88 L153 94 L138 102 Z" />
          <path d="M139 108 L155 114 L139 122 Z" />
        </g>
      ) : null;
      const wings =
        stage === 3 ? (
          <g fill={p.shade} {...line}>
            <path d="M64 110 C34 100 22 72 32 54 C42 72 54 82 70 88 Z" />
            <path d="M136 110 C166 100 178 72 168 54 C158 72 146 82 130 88 Z" />
          </g>
        ) : null;
      return { behind: <>{wings}{spikes}</>, front: <>{horns}{sparkles}</> };
    }
  }
}
