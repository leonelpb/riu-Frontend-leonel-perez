import { Component, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'app-canvas-bg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<canvas #bgCanvas class="canvas-bg"></canvas>',
  styles: `
    :host {
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class CanvasBgComponent implements AfterViewInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private rafId = 0;
  private startTime = 0;

  private readonly INDIGO = '97, 27, 238';
  private readonly SLATE = '97, 121, 127';

  private readonly RING_COUNT = 9;
  private readonly RING_SPEED = 0.08;
  private readonly RING_SPIKE_AMP = 0.13;

  private readonly hostRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const host = this.hostRef.nativeElement;
    this.canvas = host.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.startTime = performance.now() / 1000;
    this.resize();
    window.addEventListener('resize', this.onResize);
    this.tick(performance.now());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
  }

  private readonly onResize = (): void => this.resize();

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = this.hostRef.nativeElement.clientWidth;
    const h = this.hostRef.nativeElement.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private tick = (now: number): void => {
    const t = now / 1000 - this.startTime;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    const ctx = this.ctx;
    const cx = w / 2;
    const cy = h / 2;

    this.drawOcean(ctx, w, h, t);
    this.drawVignette(ctx, cx, cy, w, h);
    this.drawTunnel(ctx, cx, cy, w, h, t);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private drawOcean(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    const phase = (t / 25) * Math.PI * 2;
    const mx = w / 2;
    const my = h / 2;
    const dx = Math.cos(phase * 0.3) * w * 0.3;
    const dy = Math.sin(phase * 0.3) * h * 0.3;
    const gradient = ctx.createRadialGradient(
      mx + dx * 0.5,
      my + dy * 0.5,
      0,
      mx - dx * 0.3,
      my - dy * 0.3,
      Math.max(w, h) * 0.8
    );
    const shift = (Math.sin(phase) + 1) / 2;
    gradient.addColorStop(0, `rgb(${lerp(13, 20, shift)}, ${lerp(13, 15, shift)}, ${lerp(18, 30, shift)})`);
    gradient.addColorStop(0.4, '#0d0d14');
    gradient.addColorStop(0.7, '#10101a');
    gradient.addColorStop(1, '#08080e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  private drawVignette(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
    const maxDim = Math.max(w, h);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.6);
    g.addColorStop(0, 'rgba(4, 4, 8, 0.7)');
    g.addColorStop(0.3, 'rgba(6, 6, 12, 0.4)');
    g.addColorStop(0.7, 'rgba(8, 8, 14, 0.15)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // ---- Tunnel rings ----

  private drawTunnel(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number): void {
    const maxRadius = Math.max(w, h) * 0.85;
    for (let i = 0; i < this.RING_COUNT; i++) {
      const offset = i / this.RING_COUNT;
      const progress = (t * this.RING_SPEED + offset) % 1;
      const radius = maxRadius * (1 - progress);
      if (radius < 2) continue;
      const alpha = Math.min(1, (1 - progress) * 0.65);
      const spikeFreq = 18 + Math.floor(i * 2.5);
      const spikeAmp = this.RING_SPIKE_AMP * (1 + progress * 0.5);
      this.drawRing(ctx, cx, cy, radius, alpha, spikeFreq, spikeAmp, t, i);
    }
  }

  private drawRing(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    alpha: number,
    spikeFreq: number,
    spikeAmp: number,
    t: number,
    index: number
  ): void {
    const pts = spikeFreq * 6;
    ctx.beginPath();
    for (let j = 0; j <= pts; j++) {
      const angle = (j / pts) * Math.PI * 2;
      let r = radius;
      r += radius * spikeAmp * (Math.abs((((angle * spikeFreq) / Math.PI) % 2) - 1) * 2 - 1);
      r += Math.sin(angle * 47 + t * 8 + index * 3) * radius * 0.008;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    ctx.shadowColor = `rgba(${this.INDIGO}, 0.8)`;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = `rgba(${this.INDIGO}, 0.5)`;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = alpha * 0.85;
    ctx.strokeStyle = `rgba(${this.SLATE}, 0.6)`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ---- Helpers ----

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
