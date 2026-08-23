import { ApplicationConfig, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { HeroRepository } from './features/heroes/data/hero.repository';

function preloadHeroes(heroRepo: HeroRepository): () => void {
  return () => {
    heroRepo.getAll().subscribe();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors([loadingInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: preloadHeroes,
      deps: [HeroRepository],
      multi: true,
    },
  ],
};
