import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Hero } from '../models/hero.model';
import { createAppError } from '../../../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class HeroLocalRepository {
  private heroes: Hero[] = [];
  private nextId = 1000;

  /**
   * Merge API-seeded heroes with locally created ones.
   *
   * Previous behavior replaced the entire collection, which caused a race condition:
   * a hero created before the seed arrived was silently overwritten when initialize()
   * ran. The new behavior keeps locally created heroes and adds API heroes that don't
   * already exist (by id), so no user mutation is ever lost.
   *
   * nextId is recalculated as max(all ids) + 1 to prevent collisions regardless of
   * whether the local hero or the API hero has the higher id.
   */
  initialize(apiHeroes: Hero[] = []): void {
    const existingIds = new Set(this.heroes.map((h) => h.id));
    const newHeroes = apiHeroes.filter((h) => !existingIds.has(h.id));
    this.heroes = [...this.heroes, ...newHeroes];

    const allIds = this.heroes.map((h) => h.id);
    this.nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1000;
  }

  getAll(): Observable<Hero[]> {
    return of([...this.heroes]).pipe(delay(300));
  }

  getById(id: number): Observable<Hero | null> {
    const hero = this.heroes.find((h) => h.id === id) || null;
    return of(hero).pipe(delay(200));
  }

  searchByName(name: string): Observable<Hero[]> {
    const filtered = this.heroes.filter((h) => h.name.toLowerCase().includes(name.toLowerCase()));
    return of([...filtered]).pipe(delay(300));
  }

  create(hero: Omit<Hero, 'id'>): Observable<Hero> {
    const newHero: Hero = { ...hero, id: this.nextId++ };
    this.heroes.push(newHero);
    return of(newHero).pipe(delay(300));
  }

  update(hero: Hero): Observable<Hero> {
    const index = this.heroes.findIndex((h) => h.id === hero.id);
    if (index === -1) {
      return throwError(() => createAppError('NOT_FOUND', `Hero with id ${hero.id} not found`));
    }
    this.heroes[index] = { ...hero };
    return of(this.heroes[index]).pipe(delay(300));
  }

  delete(id: number): Observable<boolean> {
    const index = this.heroes.findIndex((h) => h.id === id);
    if (index === -1) {
      return throwError(() => createAppError('NOT_FOUND', `Hero with id ${id} not found`));
    }
    this.heroes.splice(index, 1);
    return of(true).pipe(delay(300));
  }
}
