export interface HeroImages {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}

export const EMPTY_HERO_IMAGES: HeroImages = { xs: '', sm: '', md: '', lg: '' };

export interface Hero {
  id: number;
  name: string;
  description: string;
  image: string;
  images?: HeroImages;
  publisher?: string;
  alignment?: 'good' | 'bad' | 'neutral';
  firstAppearance?: string;
  powerstats?: Powerstats;
}

export interface Powerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}
