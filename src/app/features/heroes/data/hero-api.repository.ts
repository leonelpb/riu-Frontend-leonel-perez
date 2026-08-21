import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuperheroApiCharacter } from '../models/superhero-api.model';
import { HeroMapper } from '../adapters/hero.mapper';
import { Hero } from '../models/hero.model';

@Injectable({ providedIn: 'root' })
export class HeroApiRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api';
  private allHeroesCache$?: Observable<SuperheroApiCharacter[]>;

  getById(id: number): Observable<Hero | null> {
    return this.http.get<SuperheroApiCharacter>(`${this.baseUrl}/id/${id}.json`).pipe(
      map((character) => HeroMapper.fromApiCharacter(character)),
      catchError(() => of(null))
    );
  }

  getAll(): Observable<Hero[]> {
    return this.fetchAllCharacters().pipe(
      map((characters) => HeroMapper.fromApiCharacters(characters)),
      catchError(() => of([]))
    );
  }

  searchByName(name: string): Observable<Hero[]> {
    return this.fetchAllCharacters().pipe(
      map((characters) => {
        const filtered = characters.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
        return HeroMapper.fromApiCharacters(filtered);
      }),
      catchError(() => of([]))
    );
  }

  private fetchAllCharacters(): Observable<SuperheroApiCharacter[]> {
    if (!this.allHeroesCache$) {
      this.allHeroesCache$ = this.http.get<SuperheroApiCharacter[]>(`${this.baseUrl}/all.json`).pipe(shareReplay(1));
    }
    return this.allHeroesCache$;
  }
}
