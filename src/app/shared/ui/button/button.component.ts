import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="classes"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel"
      [attr.aria-busy]="loading"
      type="button"
    >
      @if (loading) {
        <span class="btn__spinner" aria-hidden="true"></span>
      }
      @if (icon && !loading) {
        <span class="btn__icon" aria-hidden="true">{{ icon }}</span>
      }
      @if (label) {
        <span class="btn__label">{{ label }}</span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() label = '';
  @Input() icon = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() ariaLabel = '';

  get classes(): string {
    return ['btn', `btn--${this.variant}`, `btn--${this.size}`, this.loading ? 'btn--loading' : '']
      .filter(Boolean)
      .join(' ');
  }
}
