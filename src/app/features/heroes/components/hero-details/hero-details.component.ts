import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { Hero } from '../../models/hero.model';
import { BadgeComponent, BadgeVariant } from '../../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-hero-details',
  standalone: true,
  imports: [BadgeComponent],
  styleUrls: ['./hero-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hero) {
      <aside class="hero-details" aria-label="Selected hero details">
        <div class="hero-details__top-bar">
          <h2 class="hero-details__panel-title">Hero Details</h2>
          <button class="hero-details__close-btn" (click)="close.emit()" aria-label="Close hero details">✕</button>
        </div>

        <div class="hero-details__columns">
          <!-- Left column: image -->
          <div class="hero-details__image-wrapper">
            <img
              [src]="hero.images?.lg || hero.images?.md || hero.image"
              [alt]="hero.name"
              class="hero-details__image"
              referrerpolicy="no-referrer"
              (error)="onImageError($event)"
            />
            <div class="hero-details__image-glow"></div>
          </div>

          <!-- Right column: data -->
          <div class="hero-details__data">
            <h3 class="hero-details__name">{{ hero.name }}</h3>

            @if (hero.description) {
              <p class="hero-details__description">{{ hero.description }}</p>
            }

            <div class="hero-details__meta">
              @if (hero.publisher) {
                <div class="hero-details__meta-item">
                  <span class="hero-details__meta-label">Publisher</span>
                  <span class="hero-details__meta-value">{{ hero.publisher }}</span>
                </div>
              }
              @if (hero.alignment) {
                <div class="hero-details__meta-item">
                  <span class="hero-details__meta-label">Alignment</span>
                  <app-badge [variant]="alignmentVariant">{{ hero.alignment }}</app-badge>
                </div>
              }
              @if (hero.firstAppearance) {
                <div class="hero-details__meta-item">
                  <span class="hero-details__meta-label">First Appearance</span>
                  <span class="hero-details__meta-value">{{ hero.firstAppearance }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Stats: outside __data so it scrolls naturally on mobile -->
          @if (hero.powerstats) {
            <div class="hero-details__stats">
              <h4 class="hero-details__stats-title">Power Stats</h4>
              @for (stat of statsEntries; track stat[0]) {
                <div class="hero-details__stat">
                  <span class="hero-details__stat-label">{{ stat[0] }}</span>
                  <div class="hero-details__stat-bar">
                    <div class="hero-details__stat-fill" [style.width.%]="stat[1]"></div>
                  </div>
                  <span class="hero-details__stat-value">{{ stat[1] }}</span>
                </div>
              }
            </div>
          }

          <!-- Actions: outside __data so it scrolls naturally on mobile -->
          <div class="hero-details__actions">
            <button
              class="hero-details__action hero-details__action--edit"
              (click)="edit.emit(hero)"
              aria-label="Edit hero"
            >
              Edit
            </button>
            <button
              class="hero-details__action hero-details__action--delete"
              (click)="delete.emit(hero)"
              aria-label="Delete hero"
            >
              Delete
            </button>
          </div>
        </div>
      </aside>
    }
  `,
})
export class HeroDetailsComponent {
  @Input() hero: Hero | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Hero>();
  @Output() delete = new EventEmitter<Hero>();

  get alignmentVariant(): BadgeVariant {
    switch (this.hero?.alignment) {
      case 'good':
        return 'success';
      case 'bad':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get statsEntries(): [string, number][] {
    if (!this.hero?.powerstats) return [];
    return Object.entries(this.hero.powerstats) as [string, number][];
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%231a1a2e" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="64">🦸</text></svg>'
      );
  }
}
