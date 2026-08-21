import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/ui/input/input.component';

@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [FormsModule, InputComponent],
  template: `
    <div class="hero-search">
      <app-input
        placeholder="Search heroes or id:70"
        [uppercase]="true"
        [(ngModel)]="searchTerm"
        (ngModelChange)="onSearch($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        flex: 1;
        min-width: 0;
      }
      .hero-search {
        width: 100%;
        max-width: 280px;
      }
      @media (min-width: 576px) {
        .hero-search {
          max-width: none;
        }
      }
    `,
  ],
})
export class HeroSearchComponent {
  @Output() search = new EventEmitter<string>();

  searchTerm = '';

  onSearch(value: string): void {
    this.searchTerm = value;
    this.search.emit(value);
  }
}
