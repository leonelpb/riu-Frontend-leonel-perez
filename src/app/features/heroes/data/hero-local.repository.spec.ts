import { fakeAsync, tick, flush } from '@angular/core/testing';
import { HeroLocalRepository } from './hero-local.repository';
import { MOCK_HEROES } from '../testing/mock-heroes';
import { createAppError } from '../../../models/app-error.model';

describe('HeroLocalRepository', () => {
  let repository: HeroLocalRepository;

  beforeEach(() => {
    repository = new HeroLocalRepository();
    repository.initialize([...MOCK_HEROES]);
  });

  describe('getAll', () => {
    it('should return all initialized heroes', fakeAsync(() => {
      let result: any[] = [];
      repository.getAll().subscribe((heroes) => {
        result = heroes;
      });
      tick(300);
      flush();

      expect(result.length).toBe(MOCK_HEROES.length);
    }));

    it('should return a copy, not the original array', fakeAsync(() => {
      let firstResult: any[] = [];
      let secondResult: any[] = [];

      repository.getAll().subscribe((heroes) => {
        firstResult = heroes;
        heroes.pop();
        repository.getAll().subscribe((heroes2) => {
          secondResult = heroes2;
        });
      });
      tick(300);
      tick(300);
      flush();

      expect(secondResult.length).toBe(MOCK_HEROES.length);
    }));
  });

  describe('getById', () => {
    it('should return a hero by id', fakeAsync(() => {
      let result: any = null;
      repository.getById(70).subscribe((hero) => {
        result = hero;
      });
      tick(200);
      flush();

      expect(result?.name).toBe('Batman');
    }));

    it('should return null for non-existent id', fakeAsync(() => {
      let result: any = null;
      repository.getById(99999).subscribe((hero) => {
        result = hero;
      });
      tick(200);
      flush();

      expect(result).toBeNull();
    }));
  });

  describe('searchByName', () => {
    it('should filter heroes by name (case-insensitive)', fakeAsync(() => {
      let result: any[] = [];
      repository.searchByName('bat').subscribe((heroes) => {
        result = heroes;
      });
      tick(300);
      flush();

      expect(result.length).toBe(3); // Batman, Batman Beyond, Batman II
      result.forEach((h) => expect(h.name.toLowerCase()).toContain('bat'));
    }));

    it('should return empty array when no match', fakeAsync(() => {
      let result: any[] = [];
      repository.searchByName('zzzznotfound').subscribe((heroes) => {
        result = heroes;
      });
      tick(300);
      flush();

      expect(result).toEqual([]);
    }));

    it('should include locally created heroes in search results', fakeAsync(() => {
      repository.create({ name: 'Wonder Bat', description: 'test', image: 'https://example.com/img.jpg' }).subscribe();
      tick(300);

      let result: any[] = [];
      repository.searchByName('Wonder').subscribe((heroes) => {
        result = heroes;
      });
      tick(300);
      flush();

      expect(result.some((h) => h.name === 'Wonder Bat')).toBeTrue();
    }));

    it('should exclude deleted heroes from search results', fakeAsync(() => {
      repository.delete(70).subscribe();
      tick(300);

      let result: any[] = [];
      repository.searchByName('Batman').subscribe((heroes) => {
        result = heroes;
      });
      tick(300);
      flush();

      expect(result.some((h) => h.id === 70)).toBeFalse();
    }));
  });

  describe('create', () => {
    it('should create a new hero with auto-generated id', fakeAsync(() => {
      const newHero = { name: 'New Hero', description: 'Test', image: 'https://example.com/img.jpg' };
      let result: any = null;

      repository.create(newHero).subscribe((hero) => {
        result = hero;
      });
      tick(300);
      flush();

      expect(result.id).toBeDefined();
      expect(result.name).toBe('New Hero');
    }));

    it('should add the hero to the internal store', fakeAsync(() => {
      const newHero = { name: 'Stored Hero', description: 'Test', image: 'https://example.com/img.jpg' };

      repository.create(newHero).subscribe(() => {
        repository.getAll().subscribe((heroes) => {
          expect(heroes.some((h) => h.name === 'Stored Hero')).toBeTrue();
        });
      });
      tick(300);
      tick(300);
      flush();
    }));

    it('should auto-increment id', fakeAsync(() => {
      let result1: any;
      let result2: any;

      repository.create({ name: 'Hero1', description: 'd', image: 'https://example.com/1.jpg' }).subscribe((h) => {
        result1 = h;
      });
      tick(300);

      repository.create({ name: 'Hero2', description: 'd', image: 'https://example.com/2.jpg' }).subscribe((h) => {
        result2 = h;
      });
      tick(300);
      flush();

      expect(result2.id).toBeGreaterThan(result1.id);
    }));
  });

  describe('update', () => {
    it('should update an existing hero', fakeAsync(() => {
      const updated = { ...MOCK_HEROES[0], name: 'Batman Updated' };
      let result: any = null;

      repository.update(updated).subscribe((hero) => {
        result = hero;
      });
      tick(300);
      flush();

      expect(result.name).toBe('Batman Updated');
    }));

    it('should return error for non-existent hero', fakeAsync(() => {
      const nonExistent = { ...MOCK_HEROES[0], id: 99999 };
      let error: any = null;

      repository.update(nonExistent).subscribe({
        error: (err) => {
          error = err;
        },
      });
      tick(300);
      flush();

      expect(error.code).toBe('NOT_FOUND');
    }));
  });

  describe('delete', () => {
    it('should delete a hero by id', fakeAsync(() => {
      let result: any = false;

      repository.delete(70).subscribe((r) => {
        result = r;
      });
      tick(300);
      flush();

      expect(result).toBeTrue();
    }));

    it('should remove hero from store', fakeAsync(() => {
      repository.delete(70).subscribe(() => {
        repository.getAll().subscribe((heroes) => {
          expect(heroes.some((h) => h.id === 70)).toBeFalse();
        });
      });
      tick(300);
      tick(300);
      flush();
    }));

    it('should return error for non-existent hero', fakeAsync(() => {
      let error: any = null;

      repository.delete(99999).subscribe({
        error: (err) => {
          error = err;
        },
      });
      tick(300);
      flush();

      expect(error.code).toBe('NOT_FOUND');
    }));
  });

  describe('initialize', () => {
    it('should set nextId to max(existing id + 1, 733)', fakeAsync(() => {
      // The initialize uses Math.max(...ids, 732) + 1, so even id=50 gives nextId=733
      const repo = new HeroLocalRepository();
      repo.initialize([{ id: 50, name: 'A', description: 'd', image: '' }]);

      let result: any;
      repo.create({ name: 'B', description: 'd', image: '' }).subscribe((h) => {
        result = h;
      });
      tick(300);
      flush();

      expect(result.id).toBe(733);
    }));

    it('should set nextId based on high hero ids', fakeAsync(() => {
      const repo = new HeroLocalRepository();
      repo.initialize([{ id: 800, name: 'High', description: 'd', image: '' }]);

      let result: any;
      repo.create({ name: 'B', description: 'd', image: '' }).subscribe((h) => {
        result = h;
      });
      tick(300);
      flush();

      expect(result.id).toBe(801);
    }));

    it('should default to 733 when no heroes', fakeAsync(() => {
      const repo = new HeroLocalRepository();
      repo.initialize([]);

      let result: any;
      repo.create({ name: 'First', description: 'd', image: '' }).subscribe((h) => {
        result = h;
      });
      tick(300);
      flush();

      expect(result.id).toBe(733);
    }));
  });
});
