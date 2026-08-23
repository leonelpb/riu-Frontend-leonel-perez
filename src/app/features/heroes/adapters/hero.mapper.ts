import { SuperheroApiCharacter } from '../models/superhero-api.model';
import { Hero, Powerstats } from '../models/hero.model';

export class HeroMapper {
  static fromApiCharacter(character: SuperheroApiCharacter): Hero {
    return {
      id: character.id,
      name: character.name,
      description: character.biography?.fullName || character.name,
      image: character.images?.md || character.images?.lg || '',
      publisher: character.biography?.publisher,
      alignment: character.biography?.alignment as Hero['alignment'],
      firstAppearance: character.biography?.firstAppearance,
      powerstats: HeroMapper.mapPowerstats(character.powerstats),
    };
  }

  static fromApiCharacters(characters: SuperheroApiCharacter[]): Hero[] {
    return characters.map(HeroMapper.fromApiCharacter);
  }

  static toApiCharacter(hero: Hero): Partial<SuperheroApiCharacter> {
    return {
      id: hero.id,
      name: hero.name,
      slug: `${hero.id}-${hero.name.toLowerCase().replace(/\s+/g, '-')}`,
      biography: {
        fullName: hero.description,
        alterEgos: 'No alter egos found.',
        aliases: [],
        placeOfBirth: '-',
        firstAppearance: hero.firstAppearance || '-',
        publisher: hero.publisher || '-',
        alignment: hero.alignment || 'neutral',
      },
      images: {
        xs: '',
        sm: '',
        md: hero.image,
        lg: hero.image,
      },
    };
  }

  private static mapPowerstats(raw: SuperheroApiCharacter['powerstats'] | undefined): Powerstats | undefined {
    if (!raw) return undefined;
    return {
      intelligence: raw.intelligence ?? 0,
      strength: raw.strength ?? 0,
      speed: raw.speed ?? 0,
      durability: raw.durability ?? 0,
      power: raw.power ?? 0,
      combat: raw.combat ?? 0,
    };
  }
}
