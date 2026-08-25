import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, switchMap, of, tap, catchError, map } from 'rxjs';
import { Hero } from '../models/hero.model';
import { HeroApiRepository } from './hero-api.repository';
import { HeroLocalRepository } from './hero-local.repository';

@Injectable({ providedIn: 'root' })
export class HeroRepository {
  private readonly api = inject(HeroApiRepository);
  private readonly local = inject(HeroLocalRepository);
  private readonly initialized$: Observable<void>;

  constructor() {
    this.initialized$ = this.fetchAndSeed().pipe(shareReplay(1));
  }

  /** Seed once from API, then all reads/writes go through local. */
  getAll(): Observable<Hero[]> {
    return this.initialized$.pipe(switchMap(() => this.local.getAll()));
  }

  /** Single source of truth: local state only. */
  getById(id: number): Observable<Hero | null> {
    return this.initialized$.pipe(switchMap(() => this.local.getById(id)));
  }

  /** Single source of truth: search local collection only. */
  searchByName(name: string): Observable<Hero[]> {
    return this.initialized$.pipe(switchMap(() => this.local.searchByName(name)));
  }

  /** Must wait for initialization — otherwise a late seed overwrites the creation. */
  create(hero: Omit<Hero, 'id'>): Observable<Hero> {
    return this.initialized$.pipe(switchMap(() => this.local.create(hero)));
  }

  /** Must wait for initialization — otherwise a late seed overwrites the mutation. */
  update(hero: Hero): Observable<Hero> {
    return this.initialized$.pipe(switchMap(() => this.local.update(hero)));
  }

  /** Must wait for initialization — otherwise a late seed could resurrect the hero. */
  delete(id: number): Observable<boolean> {
    return this.initialized$.pipe(switchMap(() => this.local.delete(id)));
  }

  /**
   * Fetch heroes from the API and seed the local repository.
   */
  private fetchAndSeed(): Observable<void> {
    return this.api.getAll().pipe(
      tap((heroes) => this.local.initialize(heroes)),
      map(() => undefined as void),
      catchError((error) => {
        console.error('HeroRepository: API seed failed, degrading to empty state', error);
        return of(undefined);
      })
    );
  }
}
