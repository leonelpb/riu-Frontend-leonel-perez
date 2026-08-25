import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';
import { HeroGridComponent } from '../../components/hero-grid/hero-grid.component';
import { HeroDetailsComponent } from '../../components/hero-details/hero-details.component';
import { HeroSearchComponent } from '../../components/hero-search/hero-search.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [HeroGridComponent, HeroDetailsComponent, HeroSearchComponent, PaginationComponent, ConfirmDialogComponent],
  styleUrls: ['./hero-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero-list-page" [class.hero-list-page--split]="showSplitPanel()">
      <header class="hero-list-page__header">
        <app-hero-search (search)="onSearchTermChange($event)" />
        <button class="hero-list-page__create-btn" (click)="navigateToNew()" aria-label="Create new hero">
          + New Hero
        </button>
      </header>

      <div class="hero-list-page__body">
        <div class="hero-list-page__grid-section" [class.hero-list-page__grid-section--narrow]="showSplitPanel()">
          @if (loading()) {
            <div class="hero-list-page__skeleton" role="status" aria-label="Loading heroes">
              @for (i of skeletonItems; track i) {
                <div class="skeleton-card">
                  <div class="skeleton-card__image"></div>
                </div>
              }
              <span class="sr-only">Loading heroes...</span>
            </div>
          } @else if (error()) {
            <div class="error-state" role="alert">
              <div class="error-state__icon" aria-hidden="true">⚠️</div>
              <h3 class="error-state__title">Unable to load heroes</h3>
              <p class="error-state__description">Something went wrong while fetching heroes.</p>
              <button class="error-state__btn" (click)="loadHeroes()" aria-label="Retry loading heroes">
                Try Again
              </button>
            </div>
          } @else if (filteredHeroes().length === 0) {
            <div class="empty-state" role="status">
              <h3 class="empty-state__title">No heroes found</h3>
              <p class="empty-state__description">
                @if (searchTerm()) {
                  No heroes match "{{ searchTerm() }}". Try a different search.
                } @else {
                  No heroes available yet.
                }
              </p>
            </div>
          } @else {
            <app-hero-grid
              [heroes]="paginatedHeroes()"
              [panelMode]="showSplitPanel() !== null"
              [uniformGrid]="!isDesktop()"
              [isMobile]="!isDesktop()"
              [isDesktop]="isDesktop()"
              [externalSelectedHero]="selectedHero()"
              (heroSelect)="onHeroSelectFromGrid($event)"
              (editHero)="navigateToEdit($event)"
              (deleteHero)="onDeleteRequest($event)"
              (viewHero)="onHeroSelectFromGrid($event)"
            />
          }

          @if (!loading() && !error() && filteredHeroes().length > 0) {
            <app-pagination
              [currentPage]="currentPage()"
              [totalItems]="filteredHeroes().length"
              [pageSize]="pageSize"
              (pageChange)="onPageChange($event)"
            />
          }
        </div>

        @if (showSplitPanel(); as hero) {
          <aside class="hero-list-page__detail-panel">
            <app-hero-details
              [hero]="hero"
              (close)="onPanelClose()"
              (edit)="navigateToEdit($event)"
              (delete)="onDeleteRequest($event)"
            />
          </aside>
        }
      </div>

      <!-- Mobile full-screen detail -->
      @if (mobileDetailHero(); as hero) {
        <div class="hero-list-page__mobile-detail">
          <app-hero-details
            [hero]="hero"
            (close)="onMobileDetailClose()"
            (edit)="navigateToEdit($event)"
            (delete)="onDeleteRequest($event)"
          />
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Hero"
      [message]="'Are you sure you want to delete ' + (heroToDelete()?.name ?? '') + '? This action cannot be undone.'"
      confirmLabel="Delete"
      icon="🗑️"
      [loading]="deleting()"
      (confirm)="onDeleteConfirm($event)"
    />
  `,
})
export class HeroListComponent implements OnInit, OnDestroy {
  private readonly heroService = inject(HeroService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly resizeSubject = new Subject<void>();
  private resizeCleanup: (() => void) | null = null;

  heroes = signal<Hero[]>([]);
  loading = signal(true);
  error = signal(false);
  searchTerm = signal('');
  currentPage = signal(1);
  heroToDelete = signal<Hero | null>(null);
  deleting = signal(false);
  showDeleteConfirm = false;

  /** The hero selected for the desktop side panel. */
  selectedHero = signal<Hero | null>(null);

  /** The hero selected for the mobile full-screen detail. */
  mobileDetailHero = signal<Hero | null>(null);

  /** Whether the viewport is wide enough for the side-panel layout. */
  isDesktop = signal(false);

  readonly pageSize = 18;

  private readonly searchSubject = new Subject<string>();

  /** When split panel should be visible: desktop + hero selected. */
  showSplitPanel = computed(() => (this.isDesktop() ? this.selectedHero() : null));

  filteredHeroes = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.heroes();

    if (!term) return all;

    // id:N search — exact numeric match
    const idMatch = term.match(/^id:(\d+)$/);
    if (idMatch) {
      const searchId = Number(idMatch[1]);
      return all.filter((h) => h.id === searchId);
    }

    return all.filter((h) => h.name.toLowerCase().includes(term));
  });

  paginatedHeroes = computed(() => {
    const heroes = this.filteredHeroes();
    const page = this.currentPage();
    const size = this.pageSize;
    const start = (page - 1) * size;
    return heroes.slice(start, start + size);
  });

  skeletonItems = Array.from({ length: 18 }, (_, i) => i);

  ngOnInit(): void {
    this.loadHeroes();
    this.setupSearch();
    this.setupDesktopDetection();
  }

  ngOnDestroy(): void {
    this.resizeCleanup?.();
    this.searchSubject.complete();
    this.resizeSubject.complete();
  }

  loadHeroes(): void {
    this.loading.set(true);
    this.error.set(false);

    this.heroService.getAll().subscribe({
      next: (heroes) => {
        this.heroes.set(heroes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  onSearchTermChange(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onHeroSelectFromGrid(hero: Hero | null): void {
    if (this.isDesktop()) {
      this.selectedHero.set(hero);
    } else {
      this.mobileDetailHero.set(hero);
    }
  }

  onPanelClose(): void {
    this.selectedHero.set(null);
  }

  onMobileDetailClose(): void {
    this.mobileDetailHero.set(null);
  }

  navigateToNew(): void {
    this.router.navigate(['/heroes', 'new']);
  }

  navigateToEdit(hero: Hero): void {
    this.router.navigate(['/heroes', hero.id, 'edit']);
  }

  onDeleteRequest(hero: Hero): void {
    this.heroToDelete.set(hero);
    this.showDeleteConfirm = true;
  }

  onDeleteConfirm(confirmed: boolean): void {
    this.showDeleteConfirm = false;

    if (!confirmed) {
      this.heroToDelete.set(null);
      return;
    }

    const hero = this.heroToDelete();
    if (!hero) return;

    this.deleting.set(true);

    this.heroService.delete(hero.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.heroToDelete.set(null);
        this.heroes.update((current) => current.filter((h) => h.id !== hero.id));

        // Clamp currentPage if delete leaves the page out of range.
        this.clampCurrentPage();

        // Clear panel if deleted hero was selected.
        if (this.selectedHero()?.id === hero.id) {
          this.selectedHero.set(null);
        }
        if (this.mobileDetailHero()?.id === hero.id) {
          this.mobileDetailHero.set(null);
        }

        this.toast.success('Hero deleted successfully!');
      },
      error: () => {
        this.deleting.set(false);
        this.toast.error('Failed to delete hero. Please try again.');
      },
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
    });
  }

  private clampCurrentPage(): void {
    const total = this.filteredHeroes().length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage() > totalPages) {
      this.currentPage.set(totalPages);
    }
  }

  private setupDesktopDetection(): void {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(min-width: 900px)');
    this.isDesktop.set(mql.matches);

    const handler = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);
    mql.addEventListener('change', handler);
    this.resizeCleanup = () => mql.removeEventListener('change', handler);
  }
}
