import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes">
      <ng-content />
      {{ label }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() label = '';

  get classes(): string {
    return `badge badge--${this.variant}`;
  }
}
