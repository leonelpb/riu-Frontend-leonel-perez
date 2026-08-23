import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { HeroRepository } from './hero.repository';
import { HeroApiRepository } from './hero-api.repository';
import { HeroLocalRepository } from './hero-local.repository';
import { MOCK_HEROES, createMockHero } from '../testing/mock-heroes';

describe('HeroRepository', () => {
  let repository: HeroRepository;
  let apiRepo: jasmine.SpyObj<HeroApiRepository>;
  let localRepo: jasmine.SpyObj<HeroLocalRepository>;

  beforeEach(() => {
    apiRepo = jasmine.createSpyObj('HeroApiRepository', ['getAll', 'getById', 'searchByName']);
    localRepo = jasmine.createSpyObj('HeroLocalRepository', [
      'getAll',
      'getById',
      'searchByName',
      'create',
      'update',
      'delete',
      'initialize',
    ]);

    TestBed.configureTestingModule({
      providers: [
        HeroRepository,
        { provide: HeroApiRepository, useValue: apiRepo },
        { provide: HeroLocalRepository, useValue: localRepo },
      ],
    });
    repository = TestBed.inject(HeroRepository);
  });

  describe('getAll', () => {
    it('should initialize from API then return local heroes', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getAll.and.returnValue(of(MOCK_HEROES));

      const heroes = await firstValueFrom(repository.getAll());

      expect(apiRepo.getAll).toHaveBeenCalledOnceWith();
      expect(localRepo.initialize).toHaveBeenCalledWith(MOCK_HEROES);
      expect(heroes.length).toBe(MOCK_HEROES.length);
    });

    it('should not re-initialize on second call', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getAll.and.returnValue(of(MOCK_HEROES));

      await firstValueFrom(repository.getAll());
      await firstValueFrom(repository.getAll());

      expect(apiRepo.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return hero from local state after initialization', async () => {
      const batman = MOCK_HEROES[0];
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getById.and.returnValue(of(batman));

      const hero = await firstValueFrom(repository.getById(70));

      expect(localRepo.getById).toHaveBeenCalledWith(70);
      expect(apiRepo.getById).not.toHaveBeenCalled();
      expect(hero).toEqual(batman);
    });

    it('should not query API directly for getById', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getById.and.returnValue(of(null));

      const hero = await firstValueFrom(repository.getById(99999));

      expect(apiRepo.getById).not.toHaveBeenCalled();
      expect(hero).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('should search local state after initialization', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      const batmanHeroes = MOCK_HEROES.filter((h) => h.name.toLowerCase().includes('bat'));
      localRepo.searchByName.and.returnValue(of(batmanHeroes));

      const heroes = await firstValueFrom(repository.searchByName('Bat'));

      expect(localRepo.searchByName).toHaveBeenCalledWith('Bat');
      expect(apiRepo.searchByName).not.toHaveBeenCalled();
      expect(heroes.length).toBeGreaterThan(0);
    });
  });

  describe('create', () => {
    it('should delegate to local repository create', async () => {
      const newHero = createMockHero();
      localRepo.create.and.returnValue(of(newHero));

      const hero = await firstValueFrom(repository.create(newHero));

      expect(localRepo.create).toHaveBeenCalledWith(newHero);
      expect(hero).toEqual(newHero);
    });
  });

  describe('update', () => {
    it('should delegate to local repository update', async () => {
      const updatedHero = createMockHero({ name: 'Updated' });
      localRepo.update.and.returnValue(of(updatedHero));

      const hero = await firstValueFrom(repository.update(updatedHero));

      expect(localRepo.update).toHaveBeenCalledWith(updatedHero);
      expect(hero.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delegate to local repository delete', async () => {
      localRepo.delete.and.returnValue(of(true));

      const result = await firstValueFrom(repository.delete(999));

      expect(localRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBeTrue();
    });
  });

  describe('CRUD integration sequences', () => {
    it('create → searchByName: created hero should appear in search', async () => {
      const newHero = createMockHero({ name: 'Wonder Bat' });
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.create.and.callFake((hero) => of({ ...hero, id: 1001 }));
      localRepo.searchByName.and.callFake((name) => {
        const allWithNew = [...MOCK_HEROES, { ...newHero, id: 1001 }];
        return of(allWithNew.filter((h) => h.name.toLowerCase().includes(name.toLowerCase())));
      });

      await firstValueFrom(repository.create(newHero));

      const results = await firstValueFrom(repository.searchByName('Wonder'));

      expect(results.some((h) => h.name === 'Wonder Bat')).toBeTrue();
    });

    it('update → getById: edited value should persist on re-read', async () => {
      const original = MOCK_HEROES[0];
      const edited = { ...original, name: 'Batman Edited' };
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.update.and.callFake((hero) => of({ ...hero }));
      localRepo.getById.and.callFake((id) => {
        if (id === original.id) return of(edited);
        return of(null);
      });

      await firstValueFrom(repository.update(edited));

      const hero = await firstValueFrom(repository.getById(original.id));

      expect(hero?.name).toBe('Batman Edited');
    });

    it('delete → getById: deleted hero should not be found', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.delete.and.returnValue(of(true));
      localRepo.getById.and.returnValue(of(null));

      await firstValueFrom(repository.delete(70));

      const hero = await firstValueFrom(repository.getById(70));

      expect(hero).toBeNull();
    });

    it('delete → searchByName: deleted hero should not appear in search', async () => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.delete.and.returnValue(of(true));
      localRepo.searchByName.and.returnValue(of([]));

      await firstValueFrom(repository.delete(70));

      const results = await firstValueFrom(repository.searchByName('Batman'));

      expect(results.length).toBe(0);
    });
  });
});
