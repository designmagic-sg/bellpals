import type { TreatKind } from '../data/bellpals';
import { PixelArt } from './Pixel';

// Pixel treats to match the BellPals. One string per row; '.' is empty.
const TREATS: Record<TreatKind, { rows: string[]; colours: Record<string, string> }> = {
  cookie: {
    rows: ['..OOOOOO..', '.OCCLLCCO.', 'OCHHHHHHCO', 'OCCHHHHCCO', 'OCDCCCCDCO', 'OCCCDCCCCO', 'OCDCCCCDCO', '.OCCCCCCO.', '..OOOOOO..'],
    colours: { O: '#7A4318', C: '#E3A257', L: '#F6CF8F', H: '#F9B934', D: '#5A2C12' },
  },
  fish: {
    rows: ['.....OOOO.....', '...OOFFFFOO.OO', '..OFEFFLFFFOFO', '.OFFFFFLFFFFFO', '..OFFFFLFFFOFO', '...OOFFFFOO.OO', '.....OOOO.....'],
    colours: { O: '#9A5A1C', F: '#F3B055', L: '#D98C33', E: '#3B1D2F' },
  },
  carrot: {
    rows: ['...G.G....', '....GG.G..', '...OGGGO..', '..OAAAAAO.', '..OALAAAO.', '..OAAAAAO.', '...OAAAO..', '...OALAO..', '....OAO...', '....OAO...', '.....O....'],
    colours: { O: '#8A3E12', A: '#FF9A3C', L: '#FFC27A', G: '#3FAE6A' },
  },
  dragonfruit: {
    rows: ['..PPPPPP..', '.PWWWWWWP.', 'PWWSWWSWWP', 'PWWWWWWWWP', 'PWSWWSWWSP', 'PWWWWWWWWP', 'PWWSWWWSWP', '.PWWWWWWP.', '..PPPPPP..'],
    colours: { P: '#F2408C', W: '#FFF3F7', S: '#3B1D2F' },
  },
};

export function TreatArt({ kind, className = '' }: { kind: TreatKind; className?: string }) {
  const t = TREATS[kind];
  return <PixelArt rows={t.rows} colours={t.colours} className={`treat-art ${className}`} />;
}
