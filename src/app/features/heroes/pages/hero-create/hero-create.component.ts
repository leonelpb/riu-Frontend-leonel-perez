import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { HeroService } from '../../services/hero.service';
import { HeroFormComponent } from '../../hero-form/hero-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-create',
  standalone: true,
  imports: [HeroFormComponent],
  template: `
    <div class="hero-create-page">
      <header class="hero-create-page__header">
        <h1 class="hero-create-page__title">Create New Hero</h1>
        <p class="hero-create-page__subtitle">Add a new hero to the database</p>
      </header>

      <app-hero-form
        [submitting]="submitting()"
        submitLabel="Create Hero"
        (submitForm)="onSubmit($event)"
        (cancel)="goBack()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @use '../../../../../styles/tokens' as *;

      .hero-create-page {
        max-width: 640px;
        margin: 0 auto;
        padding: $space-lg 0;

        &__header {
          margin-bottom: $space-xl;
        }

        &__title {
          font-size: $font-size-2xl;
          font-weight: $font-weight-bold;
          margin-bottom: $space-xs;
        }

        &__subtitle {
          color: $color-text-muted;
          font-size: $font-size-sm;
        }
      }
    `,
  ],
})
export class HeroCreateComponent {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  submitting = signal(false);

  onSubmit(heroData: Omit<Hero, 'id' | 'powerstats'>): void {
    this.submitting.set(true);

    this.heroService.create(heroData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Hero created successfully!');
        this.router.navigate(['/heroes']);
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Failed to create hero. Please try again.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/heroes']);
  }
}
