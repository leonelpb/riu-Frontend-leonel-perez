export interface Hero {
  id: number;
  name: string;
  description: string;
  image: string;
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
