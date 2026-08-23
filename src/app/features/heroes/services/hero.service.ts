import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Hero } from '../models/hero.model';
import { HeroRepository } from '../data/hero.repository';
import { createAppError } from '../../../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly repository = inject(HeroRepository);

  getAll(): Observable<Hero[]> {
    return this.repository.getAll().pipe(
      catchError((error) => {
        console.error('Failed to fetch heroes:', error);
        return throwError(() => createAppError('API_DOWN', 'Failed to load heroes. Please try again.', error));
      })
    );
  }

  getById(id: string): Observable<Hero | null> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return of(null);
    }
    return this.repository.getById(numericId).pipe(
      catchError((error) => {
        console.error(`Failed to fetch hero ${id}:`, error);
        return throwError(() => createAppError('NOT_FOUND', `Hero ${id} not found`, error));
      })
    );
  }

  searchByName(name: string): Observable<Hero[]> {
    if (!name.trim()) return this.getAll();

    return this.repository.searchByName(name).pipe(
      catchError((error) => {
        console.error(`Failed to search heroes by name "${name}":`, error);
        return throwError(() => createAppError('API_DOWN', 'Search failed. Please try again.', error));
      })
    );
  }

  create(hero: Omit<Hero, 'id'>): Observable<Hero> {
    if (!hero.name?.trim()) {
      return throwError(() => createAppError('INCOMPLETE_DATA', 'Hero name is required'));
    }

    return this.repository.create(hero).pipe(
      catchError((error) => {
        console.error('Failed to create hero:', error);
        return throwError(() => createAppError('HTTP_ERROR', 'Failed to create hero', error));
      })
    );
  }

  update(hero: Hero): Observable<Hero> {
    return this.repository.update(hero).pipe(
      catchError((error) => {
        console.error(`Failed to update hero ${hero.id}:`, error);
        return throwError(() => createAppError('HTTP_ERROR', 'Failed to update hero', error));
      })
    );
  }

  delete(id: number): Observable<boolean> {
    return this.repository.delete(id).pipe(
      catchError((error) => {
        console.error(`Failed to delete hero ${id}:`, error);
        return throwError(() => createAppError('HTTP_ERROR', 'Failed to delete hero', error));
      })
    );
  }
}
