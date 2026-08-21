export interface SuperheroApiCharacter {
  id: number;
  name: string;
  slug: string;
  powerstats: SuperheroApiPowerstats;
  appearance: SuperheroApiAppearance;
  biography: SuperheroApiBiography;
  work: SuperheroApiWork;
  connections: SuperheroApiConnections;
  images: SuperheroApiImages;
}

export interface SuperheroApiPowerstats {
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
}

export interface SuperheroApiAppearance {
  gender: string;
  race: string;
  height: string[];
  weight: string[];
  eyeColor: string;
  hairColor: string;
}

export interface SuperheroApiBiography {
  fullName: string;
  alterEgos: string;
  aliases: string[];
  placeOfBirth: string;
  firstAppearance: string;
  publisher: string;
  alignment: string;
}

export interface SuperheroApiWork {
  occupation: string;
  base: string;
}

export interface SuperheroApiConnections {
  groupAffiliation: string;
  relatives: string;
}

export interface SuperheroApiImages {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}
