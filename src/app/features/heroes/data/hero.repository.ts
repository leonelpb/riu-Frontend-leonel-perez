import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { Hero } from '../models/hero.model';
import { HeroApiRepository } from './hero-api.repository';
import { HeroLocalRepository } from './hero-local.repository';

@Injectable({ providedIn: 'root' })
export class HeroRepository {
  private readonly api = inject(HeroApiRepository);
  private readonly local = inject(HeroLocalRepository);
  private initialized = false;

  /** Seed once from API, then all reads/writes go through local. */
  getAll(): Observable<Hero[]> {
    return this.ensureInitialized().pipe(switchMap(() => this.local.getAll()));
  }

  /** Single source of truth: local state only. */
  getById(id: number): Observable<Hero | null> {
    return this.ensureInitialized().pipe(switchMap(() => this.local.getById(id)));
  }

  /** Single source of truth: search local collection only. */
  searchByName(name: string): Observable<Hero[]> {
    return this.ensureInitialized().pipe(switchMap(() => this.local.searchByName(name)));
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
