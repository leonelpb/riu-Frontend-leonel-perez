import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HeroApiRepository } from './hero-api.repository';
import { SuperheroApiCharacter } from '../models/superhero-api.model';

const mockCharacter: SuperheroApiCharacter = {
  id: 70,
  name: 'Batman',
  slug: '70-batman',
  powerstats: { intelligence: 100, strength: 26, speed: 27, durability: 50, power: 47, combat: 100 },
  appearance: {
    gender: 'Male',
    race: 'Human',
    height: ['6\'2"', '188 cm'],
    weight: ['210 lb', '95 kg'],
    eyeColor: 'blue',
    hairColor: 'black',
  },
  biography: {
    fullName: 'Bruce Wayne',
    alterEgos: 'No alter egos found.',
    aliases: [],
    placeOfBirth: 'Gotham City',
    firstAppearance: 'Detective Comics #27',
    publisher: 'DC Comics',
    alignment: 'good',
  },
  work: { occupation: 'Businessman', base: 'Gotham City' },
  connections: { groupAffiliation: 'Batman Family', relatives: 'Thomas Wayne' },
  images: { xs: '', sm: '', md: 'md.jpg', lg: 'lg.jpg' },
};

const mockCharacters: SuperheroApiCharacter[] = [
  mockCharacter,
  { ...mockCharacter, id: 1, name: 'Superman', slug: '1-superman' },
  { ...mockCharacter, id: 2, name: 'Spider-Man', slug: '2-spider-man' },
];

/** Match by URL suffix — works regardless of environment.apiBaseUrl value */
const ALL_URL = /\/all\.json$/;
const ID_URL = /\/id\/\d+\.json$/;

describe('HeroApiRepository', () => {
  let repository: HeroApiRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeroApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(HeroApiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getById', () => {
    it('should fetch a hero by id and map it', () => {
      repository.getById(70).subscribe((hero) => {
        expect(hero).toBeTruthy();
        expect(hero!.id).toBe(70);
        expect(hero!.name).toBe('Batman');
        expect(hero!.description).toBe('Bruce Wayne');
      });

      const req = httpMock.expectOne((r) => ID_URL.test(r.url));
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);
    });

    it('should return null on HTTP error', () => {
      repository.getById(70).subscribe((hero) => {
        expect(hero).toBeNull();
      });

      const req = httpMock.expectOne((r) => ID_URL.test(r.url));
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getAll', () => {
    it('should fetch all heroes and map them', () => {
      repository.getAll().subscribe((heroes) => {
        expect(heroes.length).toBe(3);
        expect(heroes[0].name).toBe('Batman');
        expect(heroes[1].name).toBe('Superman');
        expect(heroes[2].name).toBe('Spider-Man');
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacters);
    });

    it('should return empty array on HTTP error', () => {
      repository.getAll().subscribe((heroes) => {
        expect(heroes).toEqual([]);
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      req.error(new ProgressEvent('error'));
    });

    it('should cache the all heroes observable', () => {
      repository.getAll().subscribe();
      repository.getAll().subscribe();

      // Only one HTTP request should be made due to shareReplay caching
      const reqs = httpMock.match((r) => ALL_URL.test(r.url));
      expect(reqs.length).toBe(1);
      reqs[0].flush(mockCharacters);
    });
  });

  describe('searchByName', () => {
    it('should filter heroes by name', () => {
      repository.searchByName('Bat').subscribe((heroes) => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('Batman');
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      req.flush(mockCharacters);
    });

    it('should be case-insensitive when filtering', () => {
      repository.searchByName('batman').subscribe((heroes) => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('Batman');
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      req.flush(mockCharacters);
    });

    it('should return empty array when no match found', () => {
      repository.searchByName('NonExistent').subscribe((heroes) => {
        expect(heroes).toEqual([]);
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      req.flush(mockCharacters);
    });

    it('should return empty array on HTTP error', () => {
      repository.searchByName('Bat').subscribe((heroes) => {
        expect(heroes).toEqual([]);
      });

      const req = httpMock.expectOne((r) => ALL_URL.test(r.url));
      req.error(new ProgressEvent('error'));
    });

    it('should use cached data for subsequent searches', () => {
      repository.searchByName('Bat').subscribe();
      repository.searchByName('Super').subscribe();

      const reqs = httpMock.match((r) => ALL_URL.test(r.url));
      expect(reqs.length).toBe(1);
      reqs[0].flush(mockCharacters);
    });
  });
});
