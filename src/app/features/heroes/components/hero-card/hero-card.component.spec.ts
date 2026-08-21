import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeroCardComponent } from './hero-card.component';
import { createMockHero } from '../../testing/mock-heroes';

describe('HeroCardComponent', () => {
  let component: HeroCardComponent;
  let fixture: ComponentFixture<HeroCardComponent>;
  const mockHero = createMockHero();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('hero', mockHero);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('.hero-card__image') as HTMLImageElement;
    expect(img?.src).toContain('hero.jpg');
  });

  it('should emit selectHero on click', () => {
    spyOn(component.selectHero, 'emit');
    component.onClick();
    expect(component.selectHero.emit).toHaveBeenCalledWith(mockHero);
  });

  it('should emit selectHero on Enter key', () => {
    spyOn(component.selectHero, 'emit');
    component.onKeyAction(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.selectHero.emit).toHaveBeenCalledWith(mockHero);
  });

  it('should emit hoverStart on mouseenter', () => {
    spyOn(component.hoverStart, 'emit');
    component.onMouseEnter();
    expect(component.hoverStart.emit).toHaveBeenCalledWith(mockHero);
  });

  it('should emit hoverEnd on mouseleave', fakeAsync(() => {
    spyOn(component.hoverEnd, 'emit');
    component.onMouseLeave();
    tick(120);
    expect(component.hoverEnd.emit).toHaveBeenCalled();
  }));

  it('should apply selected class when selected', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card--selected')).toBeTruthy();
  });

  it('should apply dimmed class when dimmed', () => {
    fixture.componentRef.setInput('dimmed', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card--dimmed')).toBeTruthy();
  });

  it('should have accessible button role', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="button"]')).toBeTruthy();
  });

  it('should have tabindex for keyboard navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Default: tabindex="-1" (keyboard-controlled via grid, not tab)
    expect(compiled.querySelector('[tabindex="-1"]')).toBeTruthy();
    // When focused by grid: tabindex="0"
    fixture.componentRef.setInput('focused', true);
    fixture.detectChanges();
    expect(compiled.querySelector('[tabindex="0"]')).toBeTruthy();
  });

  it('should have aria-label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('Select Test Hero');
  });

  it('should have aria-pressed', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[aria-pressed]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should show placeholder when image is empty', () => {
    fixture.componentRef.setInput('hero', createMockHero({ image: '' }));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__placeholder')).toBeTruthy();
  });

  it('should always have hero-card-host class', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.classList.contains('hero-card-host')).toBeTrue();
  });

  it('should not show name text in card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__name')).toBeFalsy();
  });

  it('should not show publisher text in card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__publisher')).toBeFalsy();
  });

  it('should not show action buttons in card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__actions')).toBeFalsy();
  });

  it('should not show overlay when hovered (overlay removed)', () => {
    component.onMouseEnter();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__overlay')).toBeFalsy();
  });

  it('should hide overlay when mouse leaves', fakeAsync(() => {
    component.onMouseEnter();
    fixture.detectChanges();
    component.onMouseLeave();
    tick(120);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__overlay')).toBeFalsy();
  }));

  it('should not show overlay when selected (overlay removed)', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__overlay')).toBeFalsy();
  });

  it('should not show overlay when hovering overlay (overlay removed)', () => {
    component.onMouseEnter();
    fixture.detectChanges();
    component.onOverlayEnter();
    component.onMouseLeave();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__overlay')).toBeFalsy();
  });

  it('should hide overlay when leaving overlay', () => {
    component.onMouseEnter();
    fixture.detectChanges();
    component.onOverlayEnter();
    component.onOverlayLeave();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card__overlay')).toBeFalsy();
  });

  it('should emit selectHero on click', () => {
    spyOn(component.selectHero, 'emit');
    const article = fixture.nativeElement.querySelector('.hero-card') as HTMLElement;
    article.click();
    expect(component.selectHero.emit).toHaveBeenCalledWith(mockHero);
  });

  it('should emit selectHero on Enter key', () => {
    spyOn(component.selectHero, 'emit');
    const article = fixture.nativeElement.querySelector('.hero-card') as HTMLElement;
    article.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(component.selectHero.emit).toHaveBeenCalledWith(mockHero);
  });

  it('should emit selectHero on Space key', () => {
    spyOn(component.selectHero, 'emit');
    const article = fixture.nativeElement.querySelector('.hero-card') as HTMLElement;
    article.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(component.selectHero.emit).toHaveBeenCalledWith(mockHero);
  });

  // --- onImageError ---

  it('should replace broken image with SVG fallback', () => {
    const img = document.createElement('img');
    img.src = 'https://broken-url.com/hero.jpg';
    component.onImageError({ target: img } as unknown as Event);
    expect(img.src).toContain('data:image/svg+xml');
    expect(img.src).toContain('svg');
  });

  // --- getAlignmentVariant ---

  describe('getAlignmentVariant', () => {
    it('should return success for good alignment', () => {
      expect(component.getAlignmentVariant(createMockHero({ alignment: 'good' }))).toBe('success');
    });

    it('should return danger for bad alignment', () => {
      expect(component.getAlignmentVariant(createMockHero({ alignment: 'bad' }))).toBe('danger');
    });

    it('should return neutral for neutral alignment', () => {
      expect(component.getAlignmentVariant(createMockHero({ alignment: 'neutral' }))).toBe('neutral');
    });

    it('should return neutral for undefined alignment', () => {
      expect(component.getAlignmentVariant(createMockHero({ alignment: undefined }))).toBe('neutral');
    });
  });

  // --- getStatsEntries ---

  describe('getStatsEntries', () => {
    it('should return entries from powerstats', () => {
      const hero = createMockHero({
        powerstats: { intelligence: 100, strength: 50, speed: 60, durability: 70, power: 80, combat: 90 },
      });
      const entries = component.getStatsEntries(hero);
      expect(entries.length).toBe(6);
      expect(entries[0][0]).toBe('intelligence');
      expect(entries[0][1]).toBe(100);
    });

    it('should return empty array when no powerstats', () => {
      const hero = createMockHero({ powerstats: undefined });
      expect(component.getStatsEntries(hero)).toEqual([]);
    });
  });

  // --- focused class ---

  it('should apply focused class when focused and not selected', () => {
    fixture.componentRef.setInput('focused', true);
    fixture.componentRef.setInput('selected', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card--focused')).toBeTruthy();
  });

  it('should not apply focused class when both focused and selected', () => {
    fixture.componentRef.setInput('focused', true);
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-card--focused')).toBeFalsy();
  });

  // --- hideOverlay ---

  it('should hide overlay and emit hoverEnd via hideOverlay', () => {
    spyOn(component.hoverEnd, 'emit');
    component.hideOverlay();
    expect(component.hoverEnd.emit).toHaveBeenCalled();
  });

  // --- onOverlayLeave ---

  it('should emit hoverEnd on overlay leave', () => {
    spyOn(component.hoverEnd, 'emit');
    component.onOverlayLeave();
    expect(component.hoverEnd.emit).toHaveBeenCalled();
  });

  // --- onOverlayEnter ---

  it('should set _overlayHovered to true on overlay enter', () => {
    component.onOverlayEnter();
    expect(component['_overlayHovered']).toBeTrue();
  });

  // --- computeOverlayPosition ---

  it('should compute overlay position with overlayOnTop', () => {
    fixture.componentRef.setInput('overlayOnTop', true);
    component.computeOverlayPosition();
    // Should not throw, _overlayBottom should be computed
    expect(component._overlayBottom).toBeDefined();
  });

  it('should compute overlay position without overlayOnTop', () => {
    fixture.componentRef.setInput('overlayOnTop', false);
    component.computeOverlayPosition();
    expect(component._overlayTop).toBeDefined();
  });

  // --- focused button role ---

  it('should have tabindex="0" when focused', () => {
    fixture.componentRef.setInput('focused', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[tabindex="0"]')).toBeTruthy();
  });

  it('should have tabindex="-1" when not focused', () => {
    fixture.componentRef.setInput('focused', false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[tabindex="-1"]')).toBeTruthy();
  });
});
