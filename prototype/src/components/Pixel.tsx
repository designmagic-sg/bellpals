import type { CSSProperties } from 'react';

// Tiny pixel drawings for effects around the BellPals (hearts, z's, crowns).
// Each string is one row of art pixels; '.' is empty.

export const PIXEL_INK = '#3B1D2F';

export const HEART = ['.RR.RR.', 'RWRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'];
export const ZED = ['ZZZZZ', '...Z.', '..Z..', '.Z...', 'ZZZZZ'];
export const SPARKLE = ['..Y..', '..Y..', 'YYWYY', '..Y..', '..Y..'];
export const WAVE = ['X..', '.X.', '..X', '..X', '..X', '.X.', 'X..'];
export const CROWN_SUPER = ['.O..O..O.', 'OYOOYOOYO', 'OYYYYYYYO', 'OYRYYYRYO', 'OYYYYYYYO', 'OOOOOOOOO'];
export const CROWN_MEGA = ['.O...O...O.', 'OYO.OYO.OYO', 'OYYOYYYOYYO', 'OYYYYYYYYYO', 'OYRYYBYYRYO', 'OYYYYYYYYYO', 'OOOOOOOOOOO'];

export const PIXEL_COLOURS: Record<string, string> = {
  O: PIXEL_INK,
  Y: '#FFCF4A',
  W: '#FFF7DA',
  R: '#EE5A5F',
  B: '#7FC8F8',
  Z: 'currentColor',
  X: 'currentColor',
};

export function PixelArt({
  rows,
  colours = PIXEL_COLOURS,
  className = '',
  style,
}: {
  rows: readonly string[];
  colours?: Record<string, string>;
  className?: string;
  style?: CSSProperties;
}) {
  const w = rows[0]!.length;
  const h = rows.length;
  const rects: { x: number; y: number; n: number; c: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      if (ch === '.') {
        x += 1;
        continue;
      }
      let n = 1;
      while (row[x + n] === ch) n += 1;
      rects.push({ x, y, n, c: colours[ch] ?? ch });
      x += n;
    }
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`px-art ${className}`} style={style} shapeRendering="crispEdges" aria-hidden="true">
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.n} height={1} fill={r.c} />
      ))}
    </svg>
  );
}
