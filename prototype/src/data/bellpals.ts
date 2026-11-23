import { STAGE_NAMES, type Stage } from '../domain/rules';

export type Species = 'ding' | 'chime' | 'jingle' | 'gong';
export type TreatKind = 'cookie' | 'fish' | 'carrot' | 'dragonfruit';

export interface BellPalInfo {
  species: Species;
  name: string;
  blurb: string;
  /** Main colour of its suit. */
  body: string;
  /** Its little bell. */
  accent: string;
  /** Soft background behind it in pictures and avatars: light centre, deeper edge. */
  tint: [string, string];
  treat: TreatKind;
  treatName: string;
}

export const SPECIES: readonly Species[] = ['ding', 'chime', 'jingle', 'gong'];

// Pixel characters from the design team (4 of the planned 5). Names and personalities are placeholders.
export const BELLPALS: Record<Species, BellPalInfo> = {
  ding: {
    species: 'ding',
    name: 'Ding',
    blurb: 'A cuddly bear cub who is always first up.',
    body: '#F3DCC6',
    accent: '#E0574F',
    tint: ['#FFF7E2', '#FBE3AE'],
    treat: 'cookie',
    treatName: 'honey cookie',
  },
  chime: {
    species: 'chime',
    name: 'Chime',
    blurb: 'A cheeky fox who winks you awake.',
    body: '#E2776E',
    accent: '#F7B84B',
    tint: ['#EFFBF5', '#CFEFDF'],
    treat: 'fish',
    treatName: 'fish cracker',
  },
  jingle: {
    species: 'jingle',
    name: 'Jingle',
    blurb: 'A bookish bunny who has never once been late.',
    body: '#A8AAD6',
    accent: '#F08A73',
    tint: ['#FFF1F6', '#F9D5E4'],
    treat: 'carrot',
    treatName: 'carrot',
  },
  gong: {
    species: 'gong',
    name: 'Gong',
    blurb: 'A little dragon with a very big voice.',
    body: '#CED4B7',
    accent: '#E7A8C8',
    tint: ['#F5F1FF', '#E0D6FA'],
    treat: 'dragonfruit',
    treatName: 'dragon fruit slice',
  },
};

export function formName(species: Species, stage: Stage): string {
  return `${STAGE_NAMES[stage]} ${BELLPALS[species].name}`;
}
