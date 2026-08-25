import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Global error:', error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.toast.error(message);
  }
}
