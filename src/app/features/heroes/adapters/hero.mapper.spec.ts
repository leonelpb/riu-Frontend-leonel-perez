import { HeroMapper } from './hero.mapper';
import { SuperheroApiCharacter } from '../models/superhero-api.model';

describe('HeroMapper', () => {
  const mockApiCharacter: SuperheroApiCharacter = {
    id: 70,
    name: 'Batman',
    slug: '70-batman',
    powerstats: {
      intelligence: 100,
      strength: 26,
      speed: 27,
      durability: 50,
      power: 47,
      combat: 100,
    },
    biography: {
      fullName: 'Bruce Wayne',
      alterEgos: 'No alter egos found.',
      aliases: ['Insider', 'Matches Malone'],
      placeOfBirth: 'Gotham City',
      firstAppearance: 'Detective Comics #27',
      publisher: 'DC Comics',
      alignment: 'good',
    },
    appearance: {
      gender: 'Male',
      race: 'Human',
      height: ['6\'2"', '188 cm'],
      weight: ['210 lb', '95 kg'],
      eyeColor: 'blue',
      hairColor: 'black',
    },
    work: {
      occupation: 'Businessman',
      base: 'Gotham City',
    },
    connections: {
      groupAffiliation: 'Batman Family, Justice League',
      relatives: 'Thomas Wayne (father), Martha Wayne (mother)',
    },
    images: {
      xs: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/xs/70-batman.jpg',
      sm: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/70-batman.jpg',
      md: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/70-batman.jpg',
      lg: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/70-batman.jpg',
    },
  };

  describe('fromApiCharacter', () => {
    it('should map API character to Hero model', () => {
      const hero = HeroMapper.fromApiCharacter(mockApiCharacter);

      expect(hero.id).toBe(70);
      expect(hero.name).toBe('Batman');
      expect(hero.description).toBe('Bruce Wayne');
      expect(hero.image).toBe('https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/70-batman.jpg');
      expect(hero.publisher).toBe('DC Comics');
      expect(hero.alignment).toBe('good');
      expect(hero.firstAppearance).toBe('Detective Comics #27');
    });

    it('should map powerstats as numbers', () => {
      const hero = HeroMapper.fromApiCharacter(mockApiCharacter);

      expect(hero.powerstats?.intelligence).toBe(100);
      expect(hero.powerstats?.strength).toBe(26);
      expect(hero.powerstats?.speed).toBe(27);
      expect(hero.powerstats?.durability).toBe(50);
      expect(hero.powerstats?.power).toBe(47);
      expect(hero.powerstats?.combat).toBe(100);
    });

    it('should use character name when fullName is missing', () => {
      const charNoFullName = {
        ...mockApiCharacter,
        biography: { ...mockApiCharacter.biography, fullName: '' },
      } as SuperheroApiCharacter;
      const hero = HeroMapper.fromApiCharacter(charNoFullName);
      expect(hero.description).toBe('Batman');
    });

    it('should handle missing powerstats', () => {
      const charWithoutStats = { ...mockApiCharacter, powerstats: undefined };
      const hero = HeroMapper.fromApiCharacter(charWithoutStats as unknown as SuperheroApiCharacter);
      expect(hero.powerstats).toBeUndefined();
    });

    it('should handle missing images', () => {
      const charWithoutImages = { ...mockApiCharacter, images: undefined };
      const hero = HeroMapper.fromApiCharacter(charWithoutImages as unknown as SuperheroApiCharacter);
      expect(hero.image).toBe('');
    });

    it('should fall back to lg when md is missing', () => {
      const charNoMd: SuperheroApiCharacter = {
        ...mockApiCharacter,
        images: { ...mockApiCharacter.images, md: '' },
      };
      const hero = HeroMapper.fromApiCharacter(charNoMd);
      expect(hero.image).toBe(mockApiCharacter.images.lg);
    });

    it('should handle powerstats with null/undefined values (defaults to 0)', () => {
      const charWithNullStats: SuperheroApiCharacter = {
        ...mockApiCharacter,
        powerstats: {
          intelligence: 0,
          strength: 0,
          speed: 0,
          durability: 0,
          power: 0,
          combat: 0,
        },
      };
      const hero = HeroMapper.fromApiCharacter(charWithNullStats);
      expect(hero.powerstats?.intelligence).toBe(0);
      expect(hero.powerstats?.combat).toBe(0);
    });
  });

  describe('fromApiCharacters', () => {
    it('should map array of API characters', () => {
      const characters = [mockApiCharacter];
      const heroes = HeroMapper.fromApiCharacters(characters);

      expect(heroes.length).toBe(1);
      expect(heroes[0].name).toBe('Batman');
    });

    it('should return empty array for empty input', () => {
      const heroes = HeroMapper.fromApiCharacters([]);
      expect(heroes).toEqual([]);
    });
  });

  describe('toApiCharacter', () => {
    it('should convert Hero to API character', () => {
      const hero = {
        id: 70,
        name: 'Batman',
        description: 'Bruce Wayne',
        image: 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/lg/70-batman.jpg',
        publisher: 'DC Comics',
        alignment: 'good' as const,
        firstAppearance: 'Detective Comics #27',
      };

      const apiChar = HeroMapper.toApiCharacter(hero);

      expect(apiChar.id).toBe(70);
      expect(apiChar.name).toBe('Batman');
      expect(apiChar.biography?.fullName).toBe('Bruce Wayne');
      expect(apiChar.biography?.publisher).toBe('DC Comics');
      expect(apiChar.biography?.alignment).toBe('good');
      expect(apiChar.biography?.firstAppearance).toBe('Detective Comics #27');
      expect(apiChar.images?.lg).toBe(hero.image);
    });

    it('should handle missing optional fields with defaults', () => {
      const hero = {
        id: 1,
        name: 'Test',
        description: 'Test desc',
        image: 'https://example.com/test.jpg',
      };

      const apiChar = HeroMapper.toApiCharacter(hero);

      expect(apiChar.biography?.publisher).toBe('-');
      expect(apiChar.biography?.alignment).toBe('neutral');
      expect(apiChar.biography?.firstAppearance).toBe('-');
    });
  });
});
