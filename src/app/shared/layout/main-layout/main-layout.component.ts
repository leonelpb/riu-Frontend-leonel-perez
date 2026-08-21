import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CanvasBgComponent } from '../../ui/canvas-bg/canvas-bg.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CanvasBgComponent],
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <app-canvas-bg />
      <div class="y2k-frame"></div>
      <main class="layout__content">
        <router-outlet />
      </main>
    </div>
  `,
})
export class MainLayoutComponent {}
