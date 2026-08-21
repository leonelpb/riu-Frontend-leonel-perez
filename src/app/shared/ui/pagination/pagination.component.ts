import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" role="navigation" aria-label="Pagination">
        <button class="pagination__btn" [disabled]="currentPage() === 1" (click)="goToPage(1)" aria-label="First page">
          «
        </button>
        <button
          class="pagination__btn"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
          aria-label="Previous page"
        >
          ‹
        </button>

        @for (page of visiblePages(); track page) {
          <button
            class="pagination__btn"
            [class.pagination__btn--active]="page === currentPage()"
            [attr.aria-current]="page === currentPage() ? 'page' : null"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
        }

        <button
          class="pagination__btn"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(currentPage() + 1)"
          aria-label="Next page"
        >
          ›
        </button>
        <button
          class="pagination__btn"
          [disabled]="currentPage() === totalPages()"
          (click)="goToPage(totalPages())"
          aria-label="Last page"
        >
          »
        </button>

        <span class="pagination__info"> Page {{ currentPage() }} of {{ totalPages() }} </span>
      </nav>
    }
  `,
})
export class PaginationComponent {
  currentPage = input(1);
  totalItems = input(0);
  pageSize = input(10);

  pageChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(total, start + 4);
      } else {
        start = Math.max(1, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
