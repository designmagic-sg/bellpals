import { STAGE_NAMES, type Stage } from '../domain/rules';

export type Species = 'ding' | 'chime' | 'buzz' | 'jingle' | 'gong';
export type TreatKind = 'cookie' | 'fish' | 'bolt' | 'carrot' | 'dragonfruit';

export interface BellPalInfo {
  species: Species;
  name: string;
  blurb: string;
  body: string;
  accent: string;
  cheek: string;
  treat: TreatKind;
  treatName: string;
}

export const SPECIES: readonly Species[] = ['ding', 'chime', 'buzz', 'jingle', 'gong'];

// Placeholder characters for the prototype; final designs come from the design team.
export const BELLPALS: Record<Species, BellPalInfo> = {
  ding: {
    species: 'ding',
    name: 'Ding',
    blurb: 'Sunny, a bit bossy, always first up.',
    body: '#FFC94A',
    accent: '#FF7A59',
    cheek: '#FF9A8A',
    treat: 'cookie',
    treatName: 'honey cookie',
  },
  chime: {
    species: 'chime',
    name: 'Chime',
    blurb: 'A calm little cat who purrs you awake.',
    body: '#6ED9B0',
    accent: '#FF8FB1',
    cheek: '#FF9FB8',
    treat: 'fish',
    treatName: 'fish cracker',
  },
  buzz: {
    species: 'buzz',
    name: 'Buzz',
    blurb: 'A tiny robot that runs on snacks.',
    body: '#6CC3FF',
    accent: '#FFD166',
    cheek: '#FF9FB8',
    treat: 'bolt',
    treatName: 'volt candy',
  },
  jingle: {
    species: 'jingle',
    name: 'Jingle',
    blurb: 'A bouncy bunny with far too much energy.',
    body: '#FF9CC7',
    accent: '#8A6CFF',
    cheek: '#FF6FA5',
    treat: 'carrot',
    treatName: 'carrot',
  },
  gong: {
    species: 'gong',
    name: 'Gong',
    blurb: 'A small dragon with a very big voice.',
    body: '#B69BFF',
    accent: '#FFB23F',
    cheek: '#FF9FB8',
    treat: 'dragonfruit',
    treatName: 'dragon fruit slice',
  },
};

export function formName(species: Species, stage: Stage): string {
  return `${STAGE_NAMES[stage]} ${BELLPALS[species].name}`;
}
