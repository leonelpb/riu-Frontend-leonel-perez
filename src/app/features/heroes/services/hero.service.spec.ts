import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { HeroService } from './hero.service';
import { HeroRepository } from '../data/hero.repository';
import { MOCK_HEROES, MOCK_SINGLE_HERO } from '../testing/mock-heroes';

describe('HeroService', () => {
  let service: HeroService;
  let repository: jasmine.SpyObj<HeroRepository>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HeroRepository', [
      'getAll',
      'getById',
      'searchByName',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [HeroService, { provide: HeroRepository, useValue: spy }],
    });

    service = TestBed.inject(HeroService);
    repository = TestBed.inject(HeroRepository) as jasmine.SpyObj<HeroRepository>;
  });

  describe('getAll', () => {
    it('should return heroes from repository', () => {
      repository.getAll.and.returnValue(of(MOCK_HEROES));

      service.getAll().subscribe((heroes) => {
        expect(heroes.length).toBe(MOCK_HEROES.length);
        expect(heroes).toEqual(MOCK_HEROES);
      });

      expect(repository.getAll).toHaveBeenCalled();
    });

    it('should throw typed error on failure', async () => {
      repository.getAll.and.returnValue(throwError(() => new Error('API error')));

      let err: any = null;
      try {
        await firstValueFrom(service.getAll());
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('API_DOWN');
    });
  });

  describe('getById', () => {
    it('should return a hero by id', () => {
      repository.getById.and.returnValue(of(MOCK_SINGLE_HERO));

      service.getById('70').subscribe((hero) => {
        expect(hero).toEqual(MOCK_SINGLE_HERO);
        expect(hero?.name).toBe('Batman');
      });

      expect(repository.getById).toHaveBeenCalledWith(70);
    });

    it('should return null when hero not found', () => {
      repository.getById.and.returnValue(of(null));

      service.getById('99999').subscribe((hero) => {
        expect(hero).toBeNull();
      });
    });

    it('should throw typed NOT_FOUND error on failure', async () => {
      repository.getById.and.returnValue(throwError(() => new Error('Not found')));

      let err: any = null;
      try {
        await firstValueFrom(service.getById('99999'));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('NOT_FOUND');
    });
  });

  describe('searchByName', () => {
    it('should search heroes by name', () => {
      const batmanHeroes = MOCK_HEROES.filter((h) => h.name.toLowerCase().includes('batman'));
      repository.searchByName.and.returnValue(of(batmanHeroes));

      service.searchByName('batman').subscribe((heroes) => {
        expect(heroes.length).toBeGreaterThan(0);
        heroes.forEach((h) => {
          expect(h.name.toLowerCase()).toContain('batman');
        });
      });

      expect(repository.searchByName).toHaveBeenCalledWith('batman');
    });

    it('should return all heroes when search term is empty', () => {
      repository.getAll.and.returnValue(of(MOCK_HEROES));

      service.searchByName('').subscribe((heroes) => {
        expect(heroes.length).toBe(MOCK_HEROES.length);
      });

      expect(repository.getAll).toHaveBeenCalled();
    });

    it('should return all heroes when search term is whitespace only', () => {
      repository.getAll.and.returnValue(of(MOCK_HEROES));

      service.searchByName('   ').subscribe((heroes) => {
        expect(heroes.length).toBe(MOCK_HEROES.length);
      });
    });

    it('should return empty array when no results', () => {
      repository.searchByName.and.returnValue(of([]));

      service.searchByName('zzzznotfound').subscribe((heroes) => {
        expect(heroes).toEqual([]);
      });
    });

    it('should throw typed error on search failure', async () => {
      repository.searchByName.and.returnValue(throwError(() => new Error('Search failed')));

      let err: any = null;
      try {
        await firstValueFrom(service.searchByName('batman'));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('API_DOWN');
    });
  });

  describe('create', () => {
    it('should create a new hero', () => {
      const newHero = {
        name: 'New Hero',
        description: 'A new hero',
        image: 'https://example.com/new.jpg',
        publisher: 'Test',
        alignment: 'good' as const,
        firstAppearance: '2024',
      };
      const createdHero = { ...newHero, id: 1000 };
      repository.create.and.returnValue(of(createdHero));

      service.create(newHero).subscribe((hero) => {
        expect(hero.id).toBe(1000);
        expect(hero.name).toBe('New Hero');
      });

      expect(repository.create).toHaveBeenCalledWith(newHero);
    });

    it('should throw INCOMPLETE_DATA error when name is empty', async () => {
      let err: any = null;
      try {
        await firstValueFrom(service.create({ name: '', description: 'test', image: 'https://example.com/img.jpg' }));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('INCOMPLETE_DATA');
    });

    it('should throw INCOMPLETE_DATA error when name is whitespace only', async () => {
      let err: any = null;
      try {
        await firstValueFrom(
          service.create({ name: '   ', description: 'test', image: 'https://example.com/img.jpg' })
        );
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('INCOMPLETE_DATA');
    });

    it('should throw INCOMPLETE_DATA error when name is undefined', async () => {
      let err: any = null;
      try {
        await firstValueFrom(service.create({ description: 'test', image: 'https://example.com/img.jpg' } as any));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('INCOMPLETE_DATA');
    });

    it('should propagate repository create error', async () => {
      const newHero = { name: 'Hero', description: 'desc', image: 'https://example.com/img.jpg' };
      repository.create.and.returnValue(throwError(() => new Error('Create failed')));

      let err: any = null;
      try {
        await firstValueFrom(service.create(newHero));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('HTTP_ERROR');
    });
  });

  describe('update', () => {
    it('should update an existing hero', () => {
      const updatedHero = { ...MOCK_SINGLE_HERO, name: 'Batman Updated' };
      repository.update.and.returnValue(of(updatedHero));

      service.update(updatedHero).subscribe((hero) => {
        expect(hero.name).toBe('Batman Updated');
      });

      expect(repository.update).toHaveBeenCalledWith(updatedHero);
    });

    it('should propagate repository update error', async () => {
      repository.update.and.returnValue(throwError(() => new Error('Update failed')));

      let err: any = null;
      try {
        await firstValueFrom(service.update(MOCK_SINGLE_HERO));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('HTTP_ERROR');
    });
  });

  describe('delete', () => {
    it('should delete a hero by id', () => {
      repository.delete.and.returnValue(of(true));

      service.delete(70).subscribe((result) => {
        expect(result).toBeTrue();
      });

      expect(repository.delete).toHaveBeenCalledWith(70);
    });

    it('should propagate repository delete error', async () => {
      repository.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      let err: any = null;
      try {
        await firstValueFrom(service.delete(999));
      } catch (e) {
        err = e;
      }

      expect(err.code).toBe('HTTP_ERROR');
    });
  });
});
