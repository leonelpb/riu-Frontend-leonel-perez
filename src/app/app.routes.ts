import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'heroes', pathMatch: 'full' },
      {
        path: 'heroes',
        loadChildren: () => import('./features/heroes/hero.routes').then((m) => m.HERO_ROUTES),
      },
    ],
  },
];
