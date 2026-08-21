import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (isOpen) {
      <div
        class="confirm-backdrop"
        (click)="onBackdropClick()"
        (keyup.escape)="onBackdropClick()"
        role="dialog"
        [attr.aria-labelledby]="titleId"
        aria-modal="true"
      >
        <div class="confirm-dialog" (click)="$event.stopPropagation()" (keyup)="$event.stopPropagation()" tabindex="-1">
          <div class="confirm-dialog__icon" aria-hidden="true">{{ icon }}</div>
          <h2 [id]="titleId" class="confirm-dialog__title">{{ title }}</h2>
          <p class="confirm-dialog__message">{{ message }}</p>
          <div class="confirm-dialog__actions">
            <app-button
              variant="ghost"
              label="Cancel"
              (click)="confirm.emit(false)"
              (keydown.enter)="confirm.emit(false)"
              (keydown.space)="confirm.emit(false)"
              ariaLabel="Cancel deletion"
            />
            <app-button
              variant="danger"
              [label]="confirmLabel"
              [loading]="loading"
              (click)="confirm.emit(true)"
              (keydown.enter)="confirm.emit(true)"
              (keydown.space)="confirm.emit(true)"
              ariaLabel="Confirm deletion"
            />
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @use '../../../../styles/tokens' as *;

      .confirm-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: $z-modal-backdrop;
        padding: $space-md;
        animation: fadeIn $transition-fast ease-out;
      }

      .confirm-dialog {
        background: $color-bg-secondary;
        border: 1px solid $color-bg-surface;
        border-radius: $radius-xl;
        padding: $space-xl;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: $shadow-lg;
        animation: slideUp $transition-base ease-out;

        &__icon {
          font-size: 3rem;
          margin-bottom: $space-md;
        }

        &__title {
          font-size: $font-size-lg;
          font-weight: $font-weight-bold;
          margin-bottom: $space-sm;
        }

        &__message {
          font-size: $font-size-sm;
          color: $color-text-secondary;
          margin-bottom: $space-lg;
          line-height: $line-height-relaxed;
        }

        &__actions {
          display: flex;
          justify-content: center;
          gap: $space-sm;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Delete';
  @Input() icon = '⚠️';
  @Input() loading = false;
  @Input() closeOnBackdrop = true;

  @Output() confirm = new EventEmitter<boolean>();

  titleId = `confirm-${Math.random().toString(36).slice(2, 9)}`;

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.confirm.emit(false);
    }
  }
}
