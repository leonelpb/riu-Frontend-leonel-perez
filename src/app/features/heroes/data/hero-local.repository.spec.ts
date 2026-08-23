import { firstValueFrom } from 'rxjs';
import { HeroLocalRepository } from './hero-local.repository';
import { MOCK_HEROES } from '../testing/mock-heroes';

describe('HeroLocalRepository', () => {
  let repository: HeroLocalRepository;

  beforeEach(() => {
    repository = new HeroLocalRepository();
    repository.initialize([...MOCK_HEROES]);
  });

  describe('getAll', () => {
    it('should return all initialized heroes', async () => {
      const result = await firstValueFrom(repository.getAll());

      expect(result.length).toBe(MOCK_HEROES.length);
    });

    it('should return a copy, not the original array', async () => {
      const firstResult = await firstValueFrom(repository.getAll());
      firstResult.pop();

      const secondResult = await firstValueFrom(repository.getAll());

      expect(secondResult.length).toBe(MOCK_HEROES.length);
    });
  });

  describe('getById', () => {
    it('should return a hero by id', async () => {
      const result = await firstValueFrom(repository.getById(70));

      expect(result?.name).toBe('Batman');
    });

    it('should return null for non-existent id', async () => {
      const result = await firstValueFrom(repository.getById(99999));

      expect(result).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should filter heroes by name (case-insensitive)', async () => {
      const result = await firstValueFrom(repository.searchByName('bat'));

      expect(result.length).toBe(3); // Batman, Batman Beyond, Batman II
      result.forEach((h) => expect(h.name.toLowerCase()).toContain('bat'));
    });

    it('should return empty array when no match', async () => {
      const result = await firstValueFrom(repository.searchByName('zzzznotfound'));

      expect(result).toEqual([]);
    });

    it('should include locally created heroes in search results', async () => {
      await firstValueFrom(
        repository.create({ name: 'Wonder Bat', description: 'test', image: 'https://example.com/img.jpg' })
      );

      const result = await firstValueFrom(repository.searchByName('Wonder'));

      expect(result.some((h) => h.name === 'Wonder Bat')).toBeTrue();
    });

    it('should exclude deleted heroes from search results', async () => {
      await firstValueFrom(repository.delete(70));

      const result = await firstValueFrom(repository.searchByName('Batman'));

      expect(result.some((h) => h.id === 70)).toBeFalse();
    });
  });

  describe('create', () => {
    it('should create a new hero with auto-generated id', async () => {
      const newHero = { name: 'New Hero', description: 'Test', image: 'https://example.com/img.jpg' };

      const result = await firstValueFrom(repository.create(newHero));

      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Hero');
    });

    it('should add the hero to the internal store', async () => {
      const newHero = { name: 'Stored Hero', description: 'Test', image: 'https://example.com/img.jpg' };

      await firstValueFrom(repository.create(newHero));
      const heroes = await firstValueFrom(repository.getAll());

      expect(heroes.some((h) => h.name === 'Stored Hero')).toBeTrue();
    });

    it('should auto-increment id', async () => {
      const result1 = await firstValueFrom(
        repository.create({ name: 'Hero1', description: 'd', image: 'https://example.com/1.jpg' })
      );

      const result2 = await firstValueFrom(
        repository.create({ name: 'Hero2', description: 'd', image: 'https://example.com/2.jpg' })
      );

      expect(result2.id).toBeGreaterThan(result1.id);
    });
  });

  describe('update', () => {
    it('should update an existing hero', async () => {
      const updated = { ...MOCK_HEROES[0], name: 'Batman Updated' };

      const result = await firstValueFrom(repository.update(updated));

      expect(result.name).toBe('Batman Updated');
    });

    it('should return error for non-existent hero', async () => {
      const nonExistent = { ...MOCK_HEROES[0], id: 99999 };
      let error: any = null;

      try {
        await firstValueFrom(repository.update(nonExistent));
      } catch (err) {
        error = err;
      }

      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('delete', () => {
    it('should delete a hero by id', async () => {
      const result = await firstValueFrom(repository.delete(70));

      expect(result).toBeTrue();
    });

    it('should remove hero from store', async () => {
      await firstValueFrom(repository.delete(70));
      const heroes = await firstValueFrom(repository.getAll());

      expect(heroes.some((h) => h.id === 70)).toBeFalse();
    });

    it('should return error for non-existent hero', async () => {
      let error: any = null;

      try {
        await firstValueFrom(repository.delete(99999));
      } catch (err) {
        error = err;
      }

      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('initialize — merge behavior', () => {
    it('should set nextId to max(existing id + 1, 1001)', async () => {
      const repo = new HeroLocalRepository();
      repo.initialize([{ id: 50, name: 'A', description: 'd', image: '' }]);

      const result = await firstValueFrom(repo.create({ name: 'B', description: 'd', image: '' }));

      expect(result.id).toBe(51);
    });

    it('should set nextId based on high hero ids', async () => {
      const repo = new HeroLocalRepository();
      repo.initialize([{ id: 800, name: 'High', description: 'd', image: '' }]);

      const result = await firstValueFrom(repo.create({ name: 'B', description: 'd', image: '' }));

      expect(result.id).toBe(801);
    });

    it('should default to 1000 when no heroes', async () => {
      const repo = new HeroLocalRepository();
      repo.initialize([]);

      const result = await firstValueFrom(repo.create({ name: 'First', description: 'd', image: '' }));

      expect(result.id).toBe(1000);
    });

    it('should preserve locally created heroes when re-initialized with seed data', async () => {
      const repo = new HeroLocalRepository();

      // 1. Seed arrives
      repo.initialize([...MOCK_HEROES]);

      // 2. User creates a hero locally
      const localHero = await firstValueFrom(
        repo.create({ name: 'Local Hero', description: 'created before late seed', image: '' })
      );
      expect(localHero.name).toBe('Local Hero');

      // 3. Late seed arrives (re-initialize)
      repo.initialize([...MOCK_HEROES]);

      // 4. Local hero MUST survive
      const allHeroes = await firstValueFrom(repo.getAll());
      expect(allHeroes.some((h) => h.name === 'Local Hero')).toBeTrue();

      // 5. Seed heroes MUST also be present
      expect(allHeroes.some((h) => h.name === 'Batman')).toBeTrue();
    });

    it('should not duplicate heroes when same seed arrives twice', async () => {
      const repo = new HeroLocalRepository();

      repo.initialize([...MOCK_HEROES]);
      repo.initialize([...MOCK_HEROES]); // duplicate seed

      const heroes = await firstValueFrom(repo.getAll());
      const batmen = heroes.filter((h) => h.name === 'Batman');
      expect(batmen.length).toBe(1);
    });

    it('should allow CRUD after merge initialization', async () => {
      const repo = new HeroLocalRepository();
      repo.initialize([...MOCK_HEROES]);

      // Create, then find via search
      await firstValueFrom(repo.create({ name: 'Post-Merge Hero', description: 'created after seed', image: '' }));

      const results = await firstValueFrom(repo.searchByName('Post-Merge'));
      expect(results.some((h) => h.name === 'Post-Merge Hero')).toBeTrue();
    });
  });
});
