import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError, lastValueFrom } from 'rxjs';
import { HeroRepository } from './hero.repository';
import { HeroApiRepository } from './hero-api.repository';
import { HeroLocalRepository } from './hero-local.repository';
import { MOCK_HEROES, createMockHero } from '../testing/mock-heroes';

/**
 * Facade tests using a REAL HeroLocalRepository and a mocked HeroApiRepository.
 */
describe('HeroRepository', () => {
  let repository: HeroRepository;
  let apiRepo: jasmine.SpyObj<HeroApiRepository>;
  let localRepo: HeroLocalRepository;

  beforeEach(() => {
    apiRepo = jasmine.createSpyObj('HeroApiRepository', ['getAll', 'getById', 'searchByName']);
    apiRepo.getAll.and.returnValue(of(MOCK_HEROES));

    TestBed.configureTestingModule({
      providers: [
        HeroRepository,
        { provide: HeroApiRepository, useValue: apiRepo },
        { provide: HeroLocalRepository, useClass: HeroLocalRepository }, // fresh instance per test
      ],
    });
    repository = TestBed.inject(HeroRepository);
    localRepo = TestBed.inject(HeroLocalRepository);
  });

  describe('getAll', () => {
    it('should initialize from API then return local heroes', async () => {
      const heroes = await firstValueFrom(repository.getAll());

      expect(apiRepo.getAll).toHaveBeenCalledOnceWith();
      expect(heroes.length).toBe(MOCK_HEROES.length);
    });

    it('should not re-initialize on second call (shareReplay idempotency)', async () => {
      await firstValueFrom(repository.getAll());
      await firstValueFrom(repository.getAll());

      expect(apiRepo.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return hero from local state after initialization', async () => {
      const hero = await firstValueFrom(repository.getById(70));

      expect(apiRepo.getById).not.toHaveBeenCalled();
      expect(hero?.name).toBe('Batman');
    });

    it('should not query API directly for getById', async () => {
      const hero = await firstValueFrom(repository.getById(99999));

      expect(apiRepo.getById).not.toHaveBeenCalled();
      expect(hero).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should search local state after initialization', async () => {
      const heroes = await firstValueFrom(repository.searchByName('Bat'));

      expect(apiRepo.searchByName).not.toHaveBeenCalled();
      expect(heroes.length).toBeGreaterThan(0);
      heroes.forEach((h) => expect(h.name.toLowerCase()).toContain('bat'));
    });
  });

  describe('create', () => {
    it('should delegate to local repository create', async () => {
      const newHero = createMockHero({ name: 'New Hero' });

      const hero = await firstValueFrom(repository.create(newHero));

      expect(hero.name).toBe('New Hero');
      expect(hero.id).toBeDefined();
    });

    it('should persist the created hero in local state', async () => {
      const newHero = createMockHero({ name: 'Persistent Hero' });

      await firstValueFrom(repository.create(newHero));

      const heroes = await firstValueFrom(repository.getAll());
      expect(heroes.some((h) => h.name === 'Persistent Hero')).toBeTrue();
    });
  });

  describe('update', () => {
    it('should delegate to local repository update', async () => {
      const batman = MOCK_HEROES.find((h) => h.name === 'Batman')!;
      const updated = { ...batman, name: 'Batman Updated' };

      const hero = await firstValueFrom(repository.update(updated));

      expect(hero.name).toBe('Batman Updated');
    });

    it('should persist the updated value on re-read', async () => {
      const batman = MOCK_HEROES.find((h) => h.name === 'Batman')!;
      const updated = { ...batman, name: 'Batman Edited' };

      await firstValueFrom(repository.update(updated));

      const hero = await firstValueFrom(repository.getById(batman.id));
      expect(hero?.name).toBe('Batman Edited');
    });
  });

  describe('delete', () => {
    it('should delete a hero by id', async () => {
      const result = await firstValueFrom(repository.delete(70));

      expect(result).toBeTrue();
    });

    it('should remove hero from local state', async () => {
      await firstValueFrom(repository.delete(70));

      const heroes = await firstValueFrom(repository.getAll());
      expect(heroes.some((h) => h.id === 70)).toBeFalse();
    });
  });

  describe('CRUD integration — real shared state', () => {
    it('create → searchByName: created hero appears in search results', async () => {
      const newHero = createMockHero({ name: 'Wonder Bat' });

      await firstValueFrom(repository.create(newHero));

      const results = await firstValueFrom(repository.searchByName('Wonder'));
      expect(results.some((h) => h.name === 'Wonder Bat')).toBeTrue();
    });

    it('update → getById: edited value persists on re-read', async () => {
      const batman = MOCK_HEROES.find((h) => h.name === 'Batman')!;
      const edited = { ...batman, name: 'Batman Edited' };

      await firstValueFrom(repository.update(edited));

      const hero = await firstValueFrom(repository.getById(batman.id));
      expect(hero?.name).toBe('Batman Edited');
    });

    it('delete → getById: deleted hero is not found', async () => {
      await firstValueFrom(repository.delete(70));

      const hero = await firstValueFrom(repository.getById(70));
      expect(hero).toBeNull();
    });

    it('delete → searchByName: deleted hero excluded from search', async () => {
      await firstValueFrom(repository.delete(70));

      const results = await firstValueFrom(repository.searchByName('Batman'));
      expect(results.some((h) => h.id === 70)).toBeFalse();
    });
  });

  describe('Race condition: initialize() merges, does not replace', () => {
    it('should preserve locally created heroes when seed arrives', async () => {
      // 1. Initialize with seed data
      await firstValueFrom(repository.getAll());

      // 2. Create a hero locally (simulates user action before or during seed)
      const localHero = createMockHero({ name: 'Race Condition Hero' });
      await firstValueFrom(repository.create(localHero));

      // 3. Simulate a late seed arriving (re-initialize from API)
      localRepo.initialize(MOCK_HEROES);

      // 4. The locally created hero MUST survive
      const results = await firstValueFrom(repository.searchByName('Race Condition'));
      expect(results.some((h) => h.name === 'Race Condition Hero')).toBeTrue();

      // 5. Original seed heroes MUST also be present
      const allHeroes = await firstValueFrom(repository.getAll());
      expect(allHeroes.some((h) => h.name === 'Batman')).toBeTrue();
    });

    it('should not create duplicate heroes when same seed arrives twice', async () => {
      await firstValueFrom(repository.getAll());

      // Seed arrives twice (e.g. retry after timeout)
      localRepo.initialize(MOCK_HEROES);
      localRepo.initialize(MOCK_HEROES);

      const heroes = await firstValueFrom(repository.getAll());
      const batmen = heroes.filter((h) => h.name === 'Batman');
      expect(batmen.length).toBe(1);
    });
  });

  describe('API failure: graceful degradation', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      apiRepo.getAll.and.returnValue(throwError(() => new Error('CDN down')));
      TestBed.configureTestingModule({
        providers: [
          HeroRepository,
          { provide: HeroApiRepository, useValue: apiRepo },
          { provide: HeroLocalRepository, useClass: HeroLocalRepository },
        ],
      });
      repository = TestBed.inject(HeroRepository);
      localRepo = TestBed.inject(HeroLocalRepository);
    });

    it('should not crash when API seed fails', async () => {
      // Should resolve (not reject) with empty state
      const heroes = await firstValueFrom(repository.getAll());
      expect(heroes.length).toBe(0);
    });

    it('should allow CRUD operations after failed seed', async () => {
      await firstValueFrom(repository.getAll());

      // Create works on empty collection
      const newHero = createMockHero({ name: 'Offline Hero' });
      const created = await firstValueFrom(repository.create(newHero));
      expect(created.name).toBe('Offline Hero');

      // Search finds it
      const results = await firstValueFrom(repository.searchByName('Offline'));
      expect(results.some((h) => h.name === 'Offline Hero')).toBeTrue();
    });
  });

  describe('Concurrent initialization', () => {
    it('should trigger only one HTTP call for multiple concurrent subscribers', async () => {
      // Subscribe to multiple operations simultaneously before initialization completes
      const p1 = lastValueFrom(repository.getAll());
      const p2 = lastValueFrom(repository.searchByName('Bat'));
      const p3 = lastValueFrom(repository.getById(70));

      await Promise.all([p1, p2, p3]);

      // shareReplay(1) + take(1) inside fetchAndSeed guarantees exactly one HTTP call
      expect(apiRepo.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
