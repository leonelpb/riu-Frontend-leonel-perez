import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, of, map } from 'rxjs';
import { Hero } from '../models/hero.model';
import { HeroApiRepository } from './hero-api.repository';
import { HeroLocalRepository } from './hero-local.repository';

@Injectable({ providedIn: 'root' })
export class HeroRepository {
  private readonly api = inject(HeroApiRepository);
  private readonly local = inject(HeroLocalRepository);
  private initialized = false;

  getAll(): Observable<Hero[]> {
    return this.ensureInitialized().pipe(switchMap(() => this.local.getAll()));
  }

  getById(id: number): Observable<Hero | null> {
    return this.api.getById(id).pipe(switchMap((hero) => (hero ? of(hero) : this.local.getById(id))));
  }

  searchByName(name: string): Observable<Hero[]> {
    return this.ensureInitialized().pipe(
      switchMap(() =>
        this.api.searchByName(name).pipe(
          map((apiHeroes) => {
            return apiHeroes;
          })
        )
      )
    );
  }

  create(hero: Omit<Hero, 'id'>): Observable<Hero> {
    return this.local.create(hero);
  }

  update(hero: Hero): Observable<Hero> {
    return this.local.update(hero);
  }

  delete(id: number): Observable<boolean> {
    return this.local.delete(id);
  }

  private ensureInitialized(): Observable<void> {
    if (this.initialized) return of(undefined);

    return this.api.getAll().pipe(
      switchMap((heroes) => {
        this.local.initialize(heroes);
        this.initialized = true;
        return of(undefined);
      })
    );
  }
}
