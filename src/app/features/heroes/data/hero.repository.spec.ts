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
    it('should return hero from API when found', (done) => {
      const batman = MOCK_HEROES[0];
      apiRepo.getById.and.returnValue(of(batman));

      repository.getById(70).subscribe((hero) => {
        expect(hero).toEqual(batman);
        done();
      });
    });

    it('should fallback to local repo when API returns null', (done) => {
      const batman = MOCK_HEROES[0];
      apiRepo.getById.and.returnValue(of(null));
      localRepo.getById.and.returnValue(of(batman));

      repository.getById(70).subscribe((hero) => {
        expect(localRepo.getById).toHaveBeenCalledWith(70);
        expect(hero).toEqual(batman);
        done();
      });
    });
  });

  describe('searchByName', () => {
    it('should initialize then delegate to API search', (done) => {
      apiRepo.getAll.and.returnValue(of(MOCK_HEROES));
      const batman = MOCK_HEROES[0];
      apiRepo.searchByName.and.returnValue(of([batman]));

      repository.searchByName('Bat').subscribe((heroes) => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('Batman');
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
});
