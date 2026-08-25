import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  HostListener,
  HostBinding,
  OnChanges,
  SimpleChanges,
  ElementRef,
  inject,
} from '@angular/core';

import { Hero } from '../../models/hero.model';
import { HeroCardComponent } from '../hero-card/hero-card.component';

@Component({
  selector: 'app-hero-grid',
  standalone: true,
  imports: [HeroCardComponent],
  styleUrls: ['./hero-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero-grid" [class.hero-grid--panel]="panelMode" role="region" aria-label="Heroes grid" tabindex="0">
      @if (panelMode || uniformGrid) {
        <div class="hero-grid__uniform">
          @for (hero of heroes; track hero.id; let i = $index) {
            <app-hero-card
              [hero]="hero"
              [selected]="getSelected(hero)"
              [dimmed]="getDimmed(hero)"
              [showActions]="showActions"
              [suppressOverlay]="panelMode"
              [overlayOnTop]="isMobile && !panelMode && isUniformLastTwoRows(i)"
              [focused]="isFocused(i)"
              [priority]="i < 6"
              (selectHero)="onCardClick($event)"
              (hoverStart)="onCardHover($event)"
              (hoverEnd)="onCardLeave()"
              (viewHero)="viewHero.emit($event)"
              (editHero)="editHero.emit($event)"
              (deleteHero)="deleteHero.emit($event)"
            />
          }
        </div>
      } @else {
        <div class="hero-grid__rows-container">
          @for (row of heroRows(); track $index; let ri = $index) {
            <div class="hero-grid__row" [class.hero-grid__row--single]="row.length === 1" [style.--row-index]="ri">
              @for (hero of row; track hero.id; let ci = $index) {
                <app-hero-card
                  [hero]="hero"
                  [selected]="getSelected(hero)"
                  [dimmed]="getDimmed(hero)"
                  [showActions]="showActions"
                  [suppressOverlay]="panelMode"
                  [overlayOnTop]="isMobile && isLastTwoRows(ri)"
                  [focused]="isFocused(getFlatIndex(ri, ci))"
                  [priority]="ri === 0"
                  (selectHero)="onCardClick($event)"
                  (hoverStart)="onCardHover($event)"
                  (hoverEnd)="onCardLeave()"
                  (viewHero)="viewHero.emit($event)"
                  (editHero)="editHero.emit($event)"
                  (deleteHero)="deleteHero.emit($event)"
                />
              }
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class HeroGridComponent implements OnChanges {
  @Input() heroes: Hero[] = [];
  @Input() showActions = true;
  @Input() panelMode = false;
  @Input() uniformGrid = false;
  @Input() isMobile = false;
  @Input() isDesktop = false;
  @Input() externalSelectedHero: Hero | null = null;

  @Output() editHero = new EventEmitter<Hero>();
  @Output() deleteHero = new EventEmitter<Hero>();
  @Output() viewHero = new EventEmitter<Hero>();
  @Output() heroSelect = new EventEmitter<Hero | null>();

  hoveredHero = signal<Hero | null>(null);
  pinnedHero = signal<Hero | null>(null);

  /** Flat index of the keyboard/gamepad-focused card (-1 = no active navigation). */
  focusedIndex = signal<number>(0);
  private previousFocusedIndex = -1;

  private elRef = inject(ElementRef);

  /** True while arrow-key navigation is engaged (drives host styling hook). */
  @HostBinding('class.hero-grid--gamepad')
  get gamepadNavigationActive(): boolean {
    return this.focusedIndex() >= 0;
  }

  /** Row-based hero grouping for pyramid layout. */
  heroRows(): Hero[][] {
    const heroes = this.heroes;
    const pattern = [8, 6, 4];
    const result: Hero[][] = [];
    let idx = 0;

    while (idx < heroes.length) {
      for (const size of pattern) {
        if (idx >= heroes.length) break;
        result.push(heroes.slice(idx, idx + size));
        idx += size;
      }
    }
    return result;
  }

  /** Whether any hero is selected (panel or internal pin). */
  get hasSelection(): boolean {
    return this.panelMode ? this.externalSelectedHero !== null : this.pinnedHero() !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['heroes']) {
      const pinned = this.pinnedHero();
      if (pinned && !this.heroes.find((h) => h.id === pinned.id)) {
        this.pinnedHero.set(null);
      }
    }
    if (changes['panelMode']) {
      this.hoveredHero.set(null);
      this.pinnedHero.set(null);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.panelMode) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.hero-card__overlay') && !target.closest('app-hero-card') && this.pinnedHero()) {
      this.pinnedHero.set(null);
    }
  }

  // --- Card selection helpers ---

  getSelected(hero: Hero): boolean {
    if (this.panelMode) {
      return this.externalSelectedHero?.id === hero.id;
    }
    return this.pinnedHero()?.id === hero.id;
  }

  getDimmed(hero: Hero): boolean {
    if (this.panelMode) {
      return this.externalSelectedHero !== null && hero.id !== this.externalSelectedHero.id;
    }
    return this.pinnedHero() !== null && hero.id !== this.pinnedHero()?.id;
  }

  // --- Row helpers ---

  /** Pyramid rows: true if the row index is in the last 2 rows. */
  isLastTwoRows(rowIndex: number): boolean {
    const rows = this.heroRows();
    return rowIndex >= rows.length - 2;
  }

  /** Uniform grid (flat): true if the flat index lands in the last 2 CSS grid rows. */
  isUniformLastTwoRows(index: number): boolean {
    const cols = window.innerWidth >= 576 ? 6 : 4;
    const totalRows = Math.ceil(this.heroes.length / cols);
    const heroRow = Math.floor(index / cols);
    return heroRow >= totalRows - 2;
  }

  // --- Keyboard navigation helpers ---

  /** Whether the card at the given flat index currently holds keyboard focus. */
  isFocused(index: number): boolean {
    return this.focusedIndex() === index;
  }

  /** Converts a (pyramid row, position-in-row) pair into the flat heroes index. */
  getFlatIndex(rowIndex: number, cardIndex: number): number {
    const rows = this.heroRows();
    let flat = 0;
    for (let r = 0; r < rowIndex; r++) {
      flat += rows[r].length;
    }
    return flat + cardIndex;
  }

  /** Detects the effective column count from rendered card positions (layout-driven). */
  private getColumns(): number {
    const section = this.elRef.nativeElement.querySelector('.hero-grid') as HTMLElement;
    if (!section) return 4;
    const cards = section.querySelectorAll('app-hero-card');
    if (cards.length < 2) return cards.length;

    const rects = Array.from(cards)
      .map((c) => {
        const el = c.querySelector('.hero-card') as HTMLElement;
        return el ? el.getBoundingClientRect() : null;
      })
      .filter(Boolean) as DOMRect[];

    if (rects.length < 2) return 1;

    const firstTop = rects[0].top;
    let cols = 1;
    for (let i = 1; i < rects.length; i++) {
      if (Math.abs(rects[i].top - firstTop) > 5) break;
      cols++;
    }
    return cols;
  }

  private getGridCards(): HTMLElement[] {
    const section = this.elRef.nativeElement.querySelector('.hero-grid') as HTMLElement;
    if (!section) return [];
    return Array.from(section.querySelectorAll('app-hero-card .hero-card')) as HTMLElement[];
  }

  private navigateGrid(direction: 'up' | 'down' | 'left' | 'right'): void {
    const heroes = this.heroes;
    if (!heroes.length) return;

    const cards = this.getGridCards();
    const cols = this.getColumns();
    const current = this.focusedIndex();

    let target = -1;

    if (current === -1) {
      target = 0;
    } else if (direction === 'right') {
      target = Math.min(current + 1, heroes.length - 1);
    } else if (direction === 'left') {
      target = Math.max(current - 1, 0);
    } else {
      // For up/down, find the card in the target row that is closest horizontally
      const currentRect = cards[current]?.getBoundingClientRect();
      if (!currentRect) return;

      const currentCenterX = currentRect.left + currentRect.width / 2;
      let bestIdx = -1;
      let bestDist = Infinity;

      for (let i = 0; i < heroes.length; i++) {
        if (i === current) continue;
        const rowDiff = Math.floor(i / cols) - Math.floor(current / cols);
        if (direction === 'down' && rowDiff !== 1) continue;
        if (direction === 'up' && rowDiff !== -1) continue;

        const rect = cards[i]?.getBoundingClientRect();
        if (!rect) continue;
        const dist = Math.abs(rect.left + rect.width / 2 - currentCenterX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      target = bestIdx;
    }

    if (target >= 0 && target < heroes.length && target !== current) {
      this.previousFocusedIndex = current;
      this.focusedIndex.set(target);
      cards[target]?.scrollIntoView({ block: 'nearest' });
      cards[target]?.focus();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Keyboard navigation is desktop-only
    if (!this.isDesktop) return;
    // Don't intercept when typing in inputs
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    // If the card already handled Enter/Space, don't double-fire
    if (event.defaultPrevented) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.navigateGrid('right');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigateGrid('left');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateGrid('down');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateGrid('up');
        break;
      case 'Escape':
        event.preventDefault();
        // First: close the hero-details panel if open
        if (this.panelMode && this.externalSelectedHero) {
          this.heroSelect.emit(null);
        } else if (!this.panelMode && this.pinnedHero()) {
          this.pinnedHero.set(null);
        } else if (this.previousFocusedIndex >= 0 && this.previousFocusedIndex < this.heroes.length) {
          // Then: go back to previous position
          const cards = this.getGridCards();
          this.focusedIndex.set(this.previousFocusedIndex);
          this.previousFocusedIndex = -1;
          cards[this.focusedIndex()]?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        if (this.focusedIndex() >= 0) {
          event.preventDefault();
          const hero = this.heroes[this.focusedIndex()];
          this.onCardClick(hero);
          this.viewHero.emit(hero);
        }
        break;
    }
  }

  // --- Events ---

  onCardHover(hero: Hero): void {
    if (this.panelMode) return;
    if (!this.pinnedHero()) {
      this.hoveredHero.set(hero);
    }
  }

  onCardLeave(): void {
    if (this.panelMode) return;
    if (!this.pinnedHero()) {
      this.hoveredHero.set(null);
    }
  }

  onCardClick(hero: Hero): void {
    if (this.panelMode) {
      if (this.externalSelectedHero?.id === hero.id) {
        this.heroSelect.emit(null);
      } else {
        this.heroSelect.emit(hero);
      }
      return;
    }

    if (this.pinnedHero()?.id === hero.id) {
      this.pinnedHero.set(null);
    } else {
      this.pinnedHero.set(hero);
      this.hoveredHero.set(null);
      this.viewHero.emit(hero);
    }
  }
}
