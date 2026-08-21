import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div [class]="'toast toast--' + toast.type" role="status">
          <span class="toast__icon" aria-hidden="true">
            @switch (toast.type) {
              @case ('success') {
                ✅
              }
              @case ('error') {
                ❌
              }
              @case ('info') {
                ℹ️
              }
            }
          </span>
          <span class="toast__message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @use '../../../../styles/tokens' as *;

      .toast-container {
        position: fixed;
        bottom: 140px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: $space-sm;
        z-index: $z-toast;
        pointer-events: none;

        @media (max-width: $breakpoint-md) {
          left: $space-md;
          right: $space-md;
          bottom: 120px;
          transform: translateX(0);
        }
      }

      .toast {
        display: flex;
        align-items: center;
        gap: $space-sm;
        padding: $space-sm $space-md;
        border-radius: $radius-md;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        box-shadow: $shadow-lg;
        animation: toastIn 0.3s ease-out;
        pointer-events: auto;

        &--success {
          background: #1a6b3a;
          color: $color-text-primary;
        }

        &--error {
          background: #8b1a1a;
          color: $color-text-primary;
        }

        &--info {
          background: $color-bg-surface;
          color: $color-text-primary;
          border: 1px solid $color-primary;
        }
      }
    `,
  ],
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
