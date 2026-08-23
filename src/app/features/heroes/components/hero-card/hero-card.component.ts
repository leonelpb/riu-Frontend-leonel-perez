import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  HostListener,
  ChangeDetectionStrategy,
  signal,
  inject,
  ElementRef,
} from '@angular/core';

import { Hero } from '../../models/hero.model';
import { BadgeComponent, BadgeVariant } from '../../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [BadgeComponent],
  styleUrls: ['./hero-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="hero-card"
      [class.hero-card--selected]="selected"
      [class.hero-card--focused]="focused && !selected"
      [class.hero-card--dimmed]="dimmed"
      [attr.tabindex]="focused ? 0 : -1"
      [attr.aria-label]="'Select ' + hero.name"
      [attr.aria-pressed]="selected"
      role="button"
    >
      <div class="hero-card__image-container">
        @if (hero.image) {
          <img
            [src]="hero.images?.sm || hero.image"
            [srcset]="hero.images?.md ? hero.images.md + ' 320w, ' + hero.images.lg + ' 640w' : ''"
            sizes="(max-width: 576px) 25vw, (max-width: 900px) 16vw, 12vw"
            [alt]="hero.name"
            class="hero-card__image"
            loading="lazy"
            referrerpolicy="no-referrer"
            (error)="onImageError($event)"
          />
        } @else {
          <div class="hero-card__placeholder" aria-hidden="true">🦸</div>
        }
      </div>

      <!-- Hover / Selected Overlay — position:fixed escapes all stacking contexts -->
      @if (_showOverlay) {
        <div
          class="hero-card__overlay"
          [class.hero-card__overlay--top]="overlayOnTop"
          [style.left.px]="_overlayLeft"
          [style.top.px]="overlayOnTop ? undefined : _overlayTop"
          [style.bottom.px]="overlayOnTop ? _overlayBottom : undefined"
          (mouseenter)="onOverlayEnter()"
          (mouseleave)="onOverlayLeave()"
          (click)="$event.stopPropagation()"
          (keydown.escape)="hideOverlay()"
          role="dialog"
          tabindex="-1"
        >
          <div class="hero-card__overlay-header">
            <img
              [src]="hero.images?.xs || hero.images?.sm || hero.image"
              [alt]="hero.name"
              class="hero-card__overlay-image"
              referrerpolicy="no-referrer"
              (error)="onImageError($event)"
            />
            <div class="hero-card__overlay-info">
              <h3 class="hero-card__overlay-name">{{ hero.name }}</h3>
              @if (hero.publisher) {
                <span class="hero-card__overlay-publisher">{{ hero.publisher }}</span>
              }
              @if (hero.alignment) {
                <app-badge [variant]="getAlignmentVariant(hero)">{{ hero.alignment }}</app-badge>
              }
            </div>
          </div>

          @if (hero.powerstats) {
            <div class="hero-card__overlay-stats">
              @for (stat of getStatsEntries(hero); track stat[0]) {
                <div class="hero-card__overlay-stat">
                  <span class="hero-card__overlay-stat-label">{{ stat[0] }}</span>
                  <div class="hero-card__overlay-stat-bar">
                    <div class="hero-card__overlay-stat-fill" [style.width.%]="stat[1]"></div>
                  </div>
                  <span class="hero-card__overlay-stat-value">{{ stat[1] }}</span>
                </div>
              }
            </div>
          }

          @if (showActions) {
            <div class="hero-card__overlay-actions">
              <button
                class="hero-card__overlay-action hero-card__overlay-action--view"
                (click)="viewHero.emit(hero); hideOverlay(); $event.stopPropagation()"
                aria-label="View hero details"
              >
                👁️ View
              </button>
              <button
                class="hero-card__overlay-action hero-card__overlay-action--edit"
                (click)="editHero.emit(hero); $event.stopPropagation()"
                aria-label="Edit hero"
              >
                ✏️ Edit
              </button>
              <button
                class="hero-card__overlay-action hero-card__overlay-action--delete"
                (click)="deleteHero.emit(hero); $event.stopPropagation()"
                aria-label="Delete hero"
              >
                🗑️ Delete
              </button>
            </div>
          }
        </div>
      }
    </article>
  `,
})
export class HeroCardComponent {
  @Input({ required: true }) hero!: Hero;
  @Input() selected = false;
  @Input() dimmed = false;
  @Input() focused = false;
  @Input() showActions = true;
  @Input() suppressOverlay = false;
  @Input() overlayOnTop = false;

  @Output() selectHero = new EventEmitter<Hero>();
  @Output() hoverStart = new EventEmitter<Hero>();
  @Output() hoverEnd = new EventEmitter<void>();
  @Output() viewHero = new EventEmitter<Hero>();
  @Output() editHero = new EventEmitter<Hero>();
  @Output() deleteHero = new EventEmitter<Hero>();

  _hovered = signal(false);
  _overlayLeft = 0;
  _overlayTop = 0;
  _overlayBottom = 0;

  private el = inject(ElementRef);
  private _leaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private _overlayHovered = false;

  /** Overlay removed — details shown via hero-details slide-in panel */
  readonly _showOverlay = false;

  @HostBinding('class.hero-card-host')
  readonly hostClass = 'hero-card-host';

  @HostListener('click')
  onClick(): void {
    this.selectHero.emit(this.hero);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeyAction(event: Event): void {
    event.preventDefault();
    this.selectHero.emit(this.hero);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.cancelLeaveTimeout();
    this._hovered.set(true);
    this.hoverStart.emit(this.hero);
    this.computeOverlayPosition();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Delay so user can move cursor to overlay
    this._leaveTimeout = setTimeout(() => {
      if (!this._overlayHovered) {
        this._hovered.set(false);
        this.hoverEnd.emit();
      }
    }, 120);
  }

  onOverlayEnter(): void {
    this._overlayHovered = true;
    this.cancelLeaveTimeout();
  }

  onOverlayLeave(): void {
    this._overlayHovered = false;
    this._hovered.set(false);
    this.hoverEnd.emit();
  }

  hideOverlay(): void {
    this._overlayHovered = false;
    this._hovered.set(false);
    this.hoverEnd.emit();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%231a1a2e" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="64">🦸</text></svg>'
      );
  }

  getStatsEntries(hero: Hero): [string, number][] {
    if (!hero.powerstats) return [];
    return Object.entries(hero.powerstats) as [string, number][];
  }

  getAlignmentVariant(hero: Hero): BadgeVariant {
    switch (hero.alignment) {
      case 'good':
        return 'success';
      case 'bad':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  /** Position overlay below or above card using viewport coordinates. */
  computeOverlayPosition(): void {
    const host = this.el.nativeElement as HTMLElement;
    const card = host.querySelector('.hero-card') as HTMLElement | null;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const overlayWidth = 280;
    const gap = 6;
    const viewW = window.innerWidth;
    const left = rect.left + rect.width / 2 - overlayWidth / 2;
    this._overlayLeft = Math.max(8, Math.min(left, viewW - overlayWidth - 8));

    if (this.overlayOnTop) {
      this._overlayBottom = window.innerHeight - rect.top + gap;
    } else {
      this._overlayTop = rect.bottom + gap;
    }
  }

  private cancelLeaveTimeout(): void {
    if (this._leaveTimeout) {
      clearTimeout(this._leaveTimeout);
      this._leaveTimeout = null;
    }
  }
}
