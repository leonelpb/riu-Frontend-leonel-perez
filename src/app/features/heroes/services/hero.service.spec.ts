import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HeroService } from './hero.service';
import { HeroRepository } from '../data/hero.repository';
import { MOCK_HEROES, MOCK_SINGLE_HERO } from '../testing/mock-heroes';
import { createAppError } from '../../../models/app-error.model';

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

    it('should throw typed error on failure', (done) => {
      repository.getAll.and.returnValue(throwError(() => new Error('API error')));

      service.getAll().subscribe({
        error: (err) => {
          expect(err.code).toBe('API_DOWN');
          done();
        },
      });
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

    it('should throw typed NOT_FOUND error on failure', (done) => {
      repository.getById.and.returnValue(throwError(() => new Error('Not found')));

      service.getById('99999').subscribe({
        error: (err) => {
          expect(err.code).toBe('NOT_FOUND');
          done();
        },
      });
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

    it('should throw typed error on search failure', (done) => {
      repository.searchByName.and.returnValue(throwError(() => new Error('Search failed')));

      service.searchByName('batman').subscribe({
        error: (err) => {
          expect(err.code).toBe('API_DOWN');
          done();
        },
      });
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

    it('should throw INCOMPLETE_DATA error when name is empty', (done) => {
      service.create({ name: '', description: 'test', image: 'https://example.com/img.jpg' }).subscribe({
        error: (err) => {
          expect(err.code).toBe('INCOMPLETE_DATA');
          done();
        },
      });
    });

    it('should throw INCOMPLETE_DATA error when name is whitespace only', (done) => {
      service.create({ name: '   ', description: 'test', image: 'https://example.com/img.jpg' }).subscribe({
        error: (err) => {
          expect(err.code).toBe('INCOMPLETE_DATA');
          done();
        },
      });
    });

    it('should throw INCOMPLETE_DATA error when name is undefined', (done) => {
      service.create({ description: 'test', image: 'https://example.com/img.jpg' } as any).subscribe({
        error: (err) => {
          expect(err.code).toBe('INCOMPLETE_DATA');
          done();
        },
      });
    });

    it('should propagate repository create error', (done) => {
      const newHero = { name: 'Hero', description: 'desc', image: 'https://example.com/img.jpg' };
      repository.create.and.returnValue(throwError(() => new Error('Create failed')));

      service.create(newHero).subscribe({
        error: (err) => {
          expect(err.code).toBe('HTTP_ERROR');
          done();
        },
      });
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

    it('should propagate repository update error', (done) => {
      repository.update.and.returnValue(throwError(() => new Error('Update failed')));

      service.update(MOCK_SINGLE_HERO).subscribe({
        error: (err) => {
          expect(err.code).toBe('HTTP_ERROR');
          done();
        },
      });
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

    it('should propagate repository delete error', (done) => {
      repository.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      service.delete(999).subscribe({
        error: (err) => {
          expect(err.code).toBe('HTTP_ERROR');
          done();
        },
      });
    });
  });
});
