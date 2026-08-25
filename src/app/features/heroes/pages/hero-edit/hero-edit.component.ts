import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeroService } from '../../services/hero.service';
import { HeroFormComponent } from '../../hero-form/hero-form.component';
import { ToastService } from '../../../../core/services/toast.service';
import { Hero } from '../../models/hero.model';

@Component({
  selector: 'app-hero-edit',
  standalone: true,
  imports: [HeroFormComponent],
  template: `
    <div class="hero-edit-page">
      @if (loading()) {
        <div class="hero-edit-page__loading">
          <div class="spinner"></div>
          <p>Loading hero...</p>
        </div>
      } @else if (hero()) {
        <header class="hero-edit-page__header">
          <h1 class="hero-edit-page__title">Edit Hero</h1>
          <p class="hero-edit-page__subtitle">Editing {{ hero()!.name }}</p>
        </header>

        <app-hero-form
          [hero]="hero()!"
          [submitting]="submitting()"
          submitLabel="Save Changes"
          (submitForm)="onSubmit($event)"
          (cancel)="goBack()"
        />
      } @else {
        <div class="error-state">
          <div class="error-state__icon" aria-hidden="true">⚠️</div>
          <h3 class="error-state__title">Hero not found</h3>
          <p class="error-state__description">The hero you're looking for doesn't exist.</p>
          <button class="error-state__btn" (click)="goBack()">Back to Heroes</button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @use '../../../../../styles/tokens' as *;

      .hero-edit-page {
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

        &__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: $space-md;
          padding: $space-3xl 0;
          color: $color-text-muted;
        }
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid $color-bg-surface;
        border-top-color: $color-primary;
        border-radius: $radius-full;
        animation: spin 0.6s linear infinite;
      }

      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $space-md;
        padding: $space-3xl 0;
        text-align: center;

        &__icon {
          font-size: 3rem;
        }
        &__title {
          font-size: $font-size-lg;
          font-weight: $font-weight-bold;
        }
        &__description {
          color: $color-text-muted;
        }

        &__btn {
          margin-top: $space-sm;
          padding: $space-sm $space-md;
          background: $color-bg-surface;
          color: $color-text-primary;
          border: 1px solid $color-secondary;
          border-radius: $radius-md;
          cursor: pointer;
          font-family: $font-family-base;
          transition: all $transition-fast;

          &:hover {
            background: $color-secondary;
          }
        }
      }
    `,
  ],
})
export class HeroEditComponent implements OnInit {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  hero = signal<Hero | null>(null);
  loading = signal(true);
  submitting = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = params.get('id') ?? '';
          this.loading.set(true);
          return this.heroService.getById(id);
        })
      )
      .subscribe({
        next: (hero) => {
          this.hero.set(hero);
          this.loading.set(false);
        },
        error: () => {
          this.hero.set(null);
          this.loading.set(false);
        },
      });
  }

  onSubmit(heroData: Omit<Hero, 'id' | 'powerstats'>): void {
    const current = this.hero();
    if (!current) return;

    this.submitting.set(true);

    const updatedHero: Hero = {
      ...current,
      ...heroData,
    };

    this.heroService.update(updatedHero).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Hero updated successfully!');
        this.router.navigate(['/heroes']);
      },
      error: () => {
        this.submitting.set(false);
        this.toast.error('Failed to update hero. Please try again.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/heroes']);
  }
}
