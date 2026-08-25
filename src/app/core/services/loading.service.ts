import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pendingCount = signal(0);
  readonly loading = signal(false);

  increment(): void {
    this.pendingCount.update((c) => c + 1);
    this.loading.set(true);
  }

  decrement(): void {
    this.pendingCount.update((c) => Math.max(0, c - 1));
    if (this.pendingCount() === 0) {
      this.loading.set(false);
    }
  }
}
