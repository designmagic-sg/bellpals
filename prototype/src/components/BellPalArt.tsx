import { useEffect, useId, useState, type CSSProperties } from 'react';
import chimeBase from '../assets/bellpals/chime-base.png';
import chimeBlink from '../assets/bellpals/chime-blink.png';
import chimeOpen from '../assets/bellpals/chime-open.png';
import chimeSleep from '../assets/bellpals/chime-sleep.png';
import dingBack from '../assets/bellpals/ding-back.png';
import dingBase from '../assets/bellpals/ding-base.png';
import dingBlink from '../assets/bellpals/ding-blink.png';
import dingJump from '../assets/bellpals/ding-jump.png';
import dingOpen from '../assets/bellpals/ding-open.png';
import dingSide from '../assets/bellpals/ding-side.png';
import dingSit from '../assets/bellpals/ding-sit.png';
import dingSleep from '../assets/bellpals/ding-sleep.png';
import dingThreeq from '../assets/bellpals/ding-threeq.png';
import dingWalk from '../assets/bellpals/ding-walk.png';
import gongBase from '../assets/bellpals/gong-base.png';
import gongOpen from '../assets/bellpals/gong-open.png';
import gongSleep from '../assets/bellpals/gong-sleep.png';
import jingleBase from '../assets/bellpals/jingle-base.png';
import jingleBlink from '../assets/bellpals/jingle-blink.png';
import jingleOpen from '../assets/bellpals/jingle-open.png';
import jingleSleep from '../assets/bellpals/jingle-sleep.png';
import { formName, type Species } from '../data/bellpals';
import type { Stage } from '../domain/rules';
import { CROWN_MEGA, CROWN_SUPER, HEART, PixelArt, SPARKLE, WAVE, ZED } from './Pixel';

export type Mood = 'idle' | 'sleepy' | 'ringing' | 'hungry' | 'open' | 'chomp' | 'happy';
/** Things the pet does on its own in its room (see PetRoom). */
export type Action = 'walk' | 'spin' | 'sit';

interface Frame {
  src: string;
  w: number;
  h: number;
  /** Mirror this frame (Ding's turn-around reuses its right-facing poses). */
  flip?: boolean;
  /** Poses where a crown would float in the wrong place. */
  noCrown?: boolean;
}

interface SpriteSet {
  base: Frame;
  blink?: Frame;
  sleep: Frame;
  open: Frame;
  /** Ding has a full sprite sheet; the others are animated from one pose. */
  happy?: Frame;
  walk?: [Frame, Frame];
  spin?: Frame[];
  sit?: Frame;
  /** Height of the base pose as a share of the square box. */
  fit: number;
  /** One art pixel, in sprite pixels. */
  px: number;
  /** Top of the head (between the ears), as a share of the base height. */
  headTop: number;
  /** Middle of the mouth, as shares of the base width and height. */
  mouth: [number, number];
  /** Head crop for round avatars: sprite width as a share of the circle, and the face's height. */
  avatar: { w: number; fy: number };
}

const f = (src: string, w: number, h: number, extra: Partial<Frame> = {}): Frame => ({ src, w, h, ...extra });

const DING_SIDE = f(dingSide, 260, 383, { noCrown: true });
const DING_THREEQ = f(dingThreeq, 280, 371);

const SPRITES: Record<Species, SpriteSet> = {
  ding: {
    base: f(dingBase, 289, 368),
    blink: f(dingBlink, 289, 368),
    sleep: f(dingSleep, 364, 275, { noCrown: true }),
    open: f(dingOpen, 289, 368),
    happy: f(dingJump, 285, 369),
    walk: [DING_THREEQ, f(dingWalk, 286, 390)],
    spin: [f(dingBase, 289, 368), DING_THREEQ, DING_SIDE, f(dingBack, 280, 375), { ...DING_SIDE, flip: true }, { ...DING_THREEQ, flip: true }],
    sit: f(dingSit, 282, 335),
    fit: 0.8,
    px: 11.5,
    headTop: 0.079,
    mouth: [0.503, 0.522],
    avatar: { w: 1.18, fy: 0.47 },
  },
  chime: {
    base: f(chimeBase, 306, 440),
    blink: f(chimeBlink, 306, 440),
    sleep: f(chimeSleep, 306, 440),
    open: f(chimeOpen, 306, 440),
    fit: 0.86,
    px: 11.2,
    headTop: 0.145,
    mouth: [0.507, 0.527],
    avatar: { w: 1.34, fy: 0.49 },
  },
  jingle: {
    base: f(jingleBase, 300, 522),
    blink: f(jingleBlink, 300, 522),
    sleep: f(jingleSleep, 300, 522),
    open: f(jingleOpen, 300, 522),
    fit: 0.92,
    px: 10.8,
    headTop: 0.236,
    mouth: [0.502, 0.596],
    avatar: { w: 1.5, fy: 0.55 },
  },
  gong: {
    base: f(gongBase, 491, 468),
    sleep: f(gongSleep, 491, 468),
    open: f(gongOpen, 491, 468),
    fit: 0.74,
    px: 11,
    headTop: 0.02,
    mouth: [0.5, 0.498],
    avatar: { w: 1.24, fy: 0.46 },
  },
};

/** Mini, Super and Mega grow a little; Super and Mega also wear a crown. */
const STAGE_SCALE: Record<Stage, number> = { 1: 0.86, 2: 0.94, 3: 1 };
/** Where the feet stand, as a share of the box height. */
const FLOOR = 0.94;

function geometry(set: SpriteSet, stage: Stage) {
  const height = set.fit * STAGE_SCALE[stage];
  return { height, width: height * (set.base.w / set.base.h), unit: (height * set.px) / set.base.h };
}

/** Where the mouth sits, as shares of the art box's width and height (used by the feeding game). */
export function mouthPoint(species: Species, stage: Stage): { x: number; y: number } {
  const set = SPRITES[species];
  const g = geometry(set, stage);
  return { x: 0.5 + (set.mouth[0] - 0.5) * g.width, y: FLOOR - g.height * (1 - set.mouth[1]) };
}

/** Decode every frame up front, so the first blink or step doesn't flash. */
export function preloadSprites(): void {
  const frames = Object.values(SPRITES).flatMap((s) => [s.base, s.blink, s.sleep, s.open, s.happy, s.sit, ...(s.walk ?? []), ...(s.spin ?? [])]);
  for (const frame of new Set(frames.filter((x): x is Frame => !!x).map((x) => x.src))) {
    const img = new Image();
    img.src = frame;
  }
}

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

function useTicker(ms: number): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!ms || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setN((v) => v + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return n;
}

/** A stable pseudo-random number per instance, so pets don't all blink at once. */
function useSeed(): number {
  const id = useId();
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h / 997;
}

interface Props {
  species: Species;
  stage: Stage;
  mood?: Mood;
  /** Dark shape only, for evolutions that aren't unlocked yet. */
  silhouette?: boolean;
  className?: string;
  label?: string;
  /** Crop to the head (for small round avatars). */
  tight?: boolean;
  action?: Action | null;
  facing?: 'left' | 'right';
}

interface Layer {
  frame: Frame;
  kind: 'main' | 'blink' | 'alt' | 'hungry' | 'chomp';
}

export function BellPalArt({
  species,
  stage,
  mood = 'idle',
  silhouette = false,
  className = '',
  label,
  tight = false,
  action = null,
  facing = 'right',
}: Props) {
  const set = SPRITES[species];
  const seed = useSeed();
  const walking = !tight && action === 'walk' && !!set.walk;
  const spinning = !tight && action === 'spin' && !!set.spin;
  const tick = useTicker(walking ? 210 : spinning ? 120 : 0);

  let main = set.base;
  let extra: Layer | null = null;
  if (walking) main = set.walk![tick % 2]!;
  else if (spinning) main = set.spin![tick % set.spin!.length]!;
  else if (!tight && action === 'sit' && set.sit) main = set.sit;
  else {
    switch (mood) {
      case 'sleepy':
        main = tight && set.sleep.w !== set.base.w ? (set.blink ?? set.base) : set.sleep;
        break;
      case 'happy':
        main = !tight && set.happy ? set.happy : set.base;
        break;
      case 'open':
        main = set.open;
        break;
      case 'ringing':
        main = !tight && set.happy ? set.happy : set.base;
        extra = { frame: set.open, kind: 'alt' };
        break;
      case 'chomp':
        extra = { frame: set.open, kind: 'chomp' };
        break;
      case 'hungry':
        extra = { frame: set.open, kind: 'hungry' };
        break;
      default:
        if (set.blink) extra = { frame: set.blink, kind: 'blink' };
    }
  }
  if (silhouette) extra = null;
  const flip = (facing === 'left') !== !!main.flip;
  const layers: Layer[] = [{ frame: main, kind: 'main' }, ...(extra ? [extra] : [])];

  const g = geometry(set, stage);
  const box = (fr: Frame): CSSProperties => {
    if (tight) {
      const w = set.avatar.w * (fr.w / set.base.w);
      const h = set.avatar.w * (set.base.h / set.base.w) * (fr.h / set.base.h);
      return { left: pct(0.5 - w / 2), top: pct(0.5 - set.avatar.fy * h), width: pct(w), height: pct(h) };
    }
    const h = g.height * (fr.h / set.base.h);
    const w = h * (fr.w / fr.h);
    return { left: pct(0.5 - w / 2), top: pct(FLOOR - h), width: pct(w), height: pct(h) };
  };

  const decorative = label === '';
  const u = g.unit;
  const headY = FLOOR - g.height * (1 - set.headTop);
  const crown = stage >= 2 && !silhouette && !tight && !main.noCrown ? (stage === 3 ? CROWN_MEGA : CROWN_SUPER) : null;
  const moodClass = walking ? 'walk' : spinning ? 'spin' : !tight && action === 'sit' ? 'sit' : mood;
  const style = {
    '--bp-delay': `${(-seed * 4).toFixed(2)}s`,
    '--bp-u': pct(u),
  } as CSSProperties;

  return (
    <span
      className={`bp bp-${moodClass}${tight ? ' bp-tight' : ''}${silhouette ? ' bp-silhouette' : ''}${stage === 3 ? ' bp-mega' : ''} ${className}`}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : (label ?? formName(species, stage))}
    >
      {!tight && <span className="bp-ground" style={{ left: pct(0.5 - g.width * 0.42), width: pct(g.width * 0.84), top: pct(FLOOR - u * 1.4), height: pct(u * 2.8) }} />}
      {stage === 3 && !silhouette && !tight && (
        <span className="bp-sparkles" aria-hidden="true">
          {[
            [0.5 - g.width * 0.62, headY + g.height * 0.18, 0],
            [0.5 + g.width * 0.58, headY + g.height * 0.05, 0.6],
            [0.5 + g.width * 0.66, headY + g.height * 0.52, 1.2],
            [0.5 - g.width * 0.56, headY + g.height * 0.62, 0.9],
          ].map(([x, y, d]) => (
            <PixelArt key={`${x}`} rows={SPARKLE} className="bp-sparkle" style={{ left: pct(x! - u * 2.5), top: pct(y! - u * 2.5), width: pct(u * 5), animationDelay: `${d}s` }} />
          ))}
        </span>
      )}
      <span className="bp-body">
        <span className="bp-flip" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
          {layers.map((layer) => (
            <img key={layer.kind} className={`bp-frame bp-frame-${layer.kind}`} src={layer.frame.src} alt="" draggable={false} style={box(layer.frame)} />
          ))}
        </span>
        {crown && (
          <PixelArt
            rows={crown}
            className="bp-crown"
            style={{ left: pct(0.5 - (crown[0]!.length * u) / 2), top: pct(headY - crown.length * u + u * 1.2), width: pct(crown[0]!.length * u) }}
          />
        )}
      </span>
      {!tight && !silhouette && mood === 'sleepy' && !walking && !spinning && (
        <span className="bp-fx bp-zzz" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <PixelArt key={i} rows={ZED} style={{ left: pct(0.5 + g.width * 0.3 + i * u * 3), top: pct(headY + u * 2 - i * u * 5), width: pct(u * (5 - i)), animationDelay: `${i * 0.6}s` }} />
          ))}
        </span>
      )}
      {!tight && !silhouette && mood === 'happy' && !walking && !spinning && (
        <span className="bp-fx bp-hearts" aria-hidden="true">
          {[
            [0.5 - g.width * 0.34, 0],
            [0.5 + g.width * 0.22, 0.45],
            [0.5 - g.width * 0.02, 0.9],
          ].map(([x, d]) => (
            <PixelArt key={d} rows={HEART} style={{ left: pct(x!), top: pct(headY - u * 4), width: pct(u * 7), animationDelay: `${d}s` }} />
          ))}
        </span>
      )}
      {!tight && !silhouette && mood === 'ringing' && (
        <span className="bp-fx bp-waves" aria-hidden="true">
          {[1, 2].map((i) => (
            <PixelArt key={`r${i}`} rows={WAVE} className="bp-wave" style={{ left: pct(0.5 + g.width * 0.5 + i * u * 3.5 - u * 2), top: pct(headY + g.height * 0.2 - i * u), width: pct(u * 3), animationDelay: `${i * 0.12}s` }} />
          ))}
          {[1, 2].map((i) => (
            <PixelArt key={`l${i}`} rows={WAVE} className="bp-wave bp-wave-l" style={{ left: pct(0.5 - g.width * 0.5 - i * u * 3.5 - u), top: pct(headY + g.height * 0.2 - i * u), width: pct(u * 3), animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
      )}
      {!tight && !silhouette && mood === 'chomp' && (
        <span className="bp-fx bp-crumbs" aria-hidden="true">
          {[-1.6, -0.6, 0.7, 1.5].map((dx, i) => {
            const m = mouthPoint(species, stage);
            return <span key={dx} style={{ left: pct(m.x + dx * u * 2), top: pct(m.y + u * (1 + (i % 2))), width: pct(u * 1.2), height: pct(u * 1.2), animationDelay: `${i * 0.05}s` }} />;
          })}
        </span>
      )}
    </span>
  );
}
