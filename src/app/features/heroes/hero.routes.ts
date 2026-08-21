import { Routes } from '@angular/router';

export const HERO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/hero-list/hero-list.component').then((m) => m.HeroListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/hero-create/hero-create.component').then((m) => m.HeroCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/hero-edit/hero-edit.component').then((m) => m.HeroEditComponent),
  },
];
