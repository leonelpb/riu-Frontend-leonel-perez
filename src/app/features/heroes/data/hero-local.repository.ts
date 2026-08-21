import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Hero } from '../models/hero.model';
import { createAppError } from '../../../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class HeroLocalRepository {
  private heroes: Hero[] = [];
  private nextId = 1000;

  initialize(heroes: Hero[]): void {
    this.heroes = [...heroes];
    this.nextId = Math.max(...heroes.map((h) => h.id), 732) + 1;
  }

  getAll(): Observable<Hero[]> {
    return of([...this.heroes]).pipe(delay(300));
  }

  getById(id: number): Observable<Hero | null> {
    const hero = this.heroes.find((h) => h.id === id) || null;
    return of(hero).pipe(delay(200));
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
