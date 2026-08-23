import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
    it('should initialize from API then return local heroes', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getAll.and.returnValue(of(MOCK_HEROES));

      repository.getAll().subscribe((heroes) => {
        expect(apiRepo.getAll).toHaveBeenCalledOnceWith();
        expect(localRepo.initialize).toHaveBeenCalledWith(MOCK_HEROES);
        expect(heroes.length).toBe(MOCK_HEROES.length);
        done();
      });
    });

    it('should not re-initialize on second call', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getAll.and.returnValue(of(MOCK_HEROES));

      repository.getAll().subscribe(() => {
        repository.getAll().subscribe(() => {
          expect(apiRepo.getAll).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  describe('getById', () => {
    it('should return hero from local state after initialization', (done) => {
      const batman = MOCK_HEROES[0];
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getById.and.returnValue(of(batman));

      repository.getById(70).subscribe((hero) => {
        expect(localRepo.getById).toHaveBeenCalledWith(70);
        expect(apiRepo.getById).not.toHaveBeenCalled();
        expect(hero).toEqual(batman);
        done();
      });
    });

    it('should not query API directly for getById', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.getById.and.returnValue(of(null));

      repository.getById(99999).subscribe((hero) => {
        expect(apiRepo.getById).not.toHaveBeenCalled();
        expect(hero).toBeNull();
        done();
      });
    });
  });

  describe('searchByName', () => {
    it('should search local state after initialization', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      const batmanHeroes = MOCK_HEROES.filter((h) => h.name.toLowerCase().includes('bat'));
      localRepo.searchByName.and.returnValue(of(batmanHeroes));

      repository.searchByName('Bat').subscribe((heroes) => {
        expect(localRepo.searchByName).toHaveBeenCalledWith('Bat');
        expect(apiRepo.searchByName).not.toHaveBeenCalled();
        expect(heroes.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('create', () => {
    it('should delegate to local repository create', (done) => {
      const newHero = createMockHero();
      localRepo.create.and.returnValue(of(newHero));

      repository.create(newHero).subscribe((hero) => {
        expect(localRepo.create).toHaveBeenCalledWith(newHero);
        expect(hero).toEqual(newHero);
        done();
      });
    });
  });

  describe('update', () => {
    it('should delegate to local repository update', (done) => {
      const updatedHero = createMockHero({ name: 'Updated' });
      localRepo.update.and.returnValue(of(updatedHero));

      repository.update(updatedHero).subscribe((hero) => {
        expect(localRepo.update).toHaveBeenCalledWith(updatedHero);
        expect(hero.name).toBe('Updated');
        done();
      });
    });
  });

  describe('delete', () => {
    it('should delegate to local repository delete', (done) => {
      localRepo.delete.and.returnValue(of(true));

      repository.delete(999).subscribe((result) => {
        expect(localRepo.delete).toHaveBeenCalledWith(999);
        expect(result).toBeTrue();
        done();
      });
    });
  });

  describe('CRUD integration sequences', () => {
    it('create → searchByName: created hero should appear in search', (done) => {
      const newHero = createMockHero({ name: 'Wonder Bat' });
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.create.and.callFake((hero) => of({ ...hero, id: 1001 }));
      localRepo.searchByName.and.callFake((name) => {
        const allWithNew = [...MOCK_HEROES, { ...newHero, id: 1001 }];
        return of(allWithNew.filter((h) => h.name.toLowerCase().includes(name.toLowerCase())));
      });

      repository.create(newHero).pipe().subscribe(() => {
        repository.searchByName('Wonder').subscribe((results) => {
          expect(results.some((h) => h.name === 'Wonder Bat')).toBeTrue();
          done();
        });
      });
    });

    it('update → getById: edited value should persist on re-read', (done) => {
      const original = MOCK_HEROES[0];
      const edited = { ...original, name: 'Batman Edited' };
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.update.and.callFake((hero) => of({ ...hero }));
      localRepo.getById.and.callFake((id) => {
        if (id === original.id) return of(edited);
        return of(null);
      });

      repository.update(edited).pipe().subscribe(() => {
        repository.getById(original.id).subscribe((hero) => {
          expect(hero?.name).toBe('Batman Edited');
          done();
        });
      });
    });

    it('delete → getById: deleted hero should not be found', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.delete.and.returnValue(of(true));
      localRepo.getById.and.returnValue(of(null));

      repository.delete(70).pipe().subscribe(() => {
        repository.getById(70).subscribe((hero) => {
          expect(hero).toBeNull();
          done();
        });
      });
    });

    it('delete → searchByName: deleted hero should not appear in search', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      localRepo.delete.and.returnValue(of(true));
      localRepo.searchByName.and.returnValue(of([]));

      repository.delete(70).pipe().subscribe(() => {
        repository.searchByName('Batman').subscribe((results) => {
          expect(results.length).toBe(0);
          done();
        });
      });
    });
  });
});
