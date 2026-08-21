import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroDetailsComponent } from './hero-details.component';
import { createMockHero } from '../../testing/mock-heroes';

describe('HeroDetailsComponent', () => {
  let component: HeroDetailsComponent;
  let fixture: ComponentFixture<HeroDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero details when hero is provided', () => {
    component.hero = createMockHero({ name: 'Test Hero', description: 'Test Description' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Hero');
    expect(compiled.textContent).toContain('Test Description');
  });

  it('should not render when hero is null', () => {
    component.hero = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-details')).toBeFalsy();
  });

  describe('alignmentVariant', () => {
    it('should return success for good alignment', () => {
      component.hero = createMockHero({ alignment: 'good' });
      expect(component.alignmentVariant).toBe('success');
    });

    it('should return danger for bad alignment', () => {
      component.hero = createMockHero({ alignment: 'bad' });
      expect(component.alignmentVariant).toBe('danger');
    });

    it('should return neutral for neutral alignment', () => {
      component.hero = createMockHero({ alignment: 'neutral' });
      expect(component.alignmentVariant).toBe('neutral');
    });

    it('should return neutral when no alignment', () => {
      component.hero = createMockHero({ alignment: undefined });
      expect(component.alignmentVariant).toBe('neutral');
    });

    it('should return neutral when hero is null', () => {
      component.hero = null;
      expect(component.alignmentVariant).toBe('neutral');
    });
  });

  describe('statsEntries', () => {
    it('should return powerstats entries when available', () => {
      component.hero = createMockHero({
        powerstats: { intelligence: 100, strength: 80, speed: 70, durability: 90, power: 85, combat: 75 },
      });

      expect(component.statsEntries.length).toBe(6);
    });

    it('should return empty array when no powerstats', () => {
      component.hero = createMockHero({ powerstats: undefined });
      expect(component.statsEntries).toEqual([]);
    });

    it('should return empty array when hero is null', () => {
      component.hero = null;
      expect(component.statsEntries).toEqual([]);
    });
  });

  describe('DOM rendering', () => {
    it('should display power stats when available', () => {
      component.hero = createMockHero({
        powerstats: { intelligence: 100, strength: 80, speed: 70, durability: 90, power: 85, combat: 75 },
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-details__stats')).toBeTruthy();
    });

    it('should not display power stats when missing', () => {
      component.hero = createMockHero({ powerstats: undefined });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-details__stats')).toBeFalsy();
    });

    it('should display publisher when available', () => {
      component.hero = createMockHero({ publisher: 'Marvel Comics' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Marvel Comics');
    });

    it('should display first appearance when available', () => {
      component.hero = createMockHero({ firstAppearance: 'Action Comics #1' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Action Comics #1');
    });

    it('should not render publisher when missing', () => {
      component.hero = createMockHero({ publisher: undefined, alignment: undefined, firstAppearance: undefined });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-details__meta-item')).toBeFalsy();
    });

    it('should not render description when missing', () => {
      component.hero = createMockHero({ description: '' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-details__description')).toBeFalsy();
    });
  });

  describe('output emissions', () => {
    it('should emit close when close button clicked', () => {
      spyOn(component.close, 'emit');
      component.hero = createMockHero();
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.hero-details__close-btn') as HTMLButtonElement;
      btn.click();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit edit with hero when edit button clicked', () => {
      spyOn(component.edit, 'emit');
      const hero = createMockHero();
      component.hero = hero;
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.hero-details__action--edit') as HTMLButtonElement;
      btn.click();
      expect(component.edit.emit).toHaveBeenCalledWith(hero);
    });

    it('should emit delete with hero when delete button clicked', () => {
      spyOn(component.delete, 'emit');
      const hero = createMockHero();
      component.hero = hero;
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.hero-details__action--delete') as HTMLButtonElement;
      btn.click();
      expect(component.delete.emit).toHaveBeenCalledWith(hero);
    });
  });

  describe('onImageError', () => {
    it('should replace broken image with SVG fallback', () => {
      const img = document.createElement('img');
      img.src = 'https://broken-url.com/hero.jpg';
      component.onImageError({ target: img } as unknown as Event);
      expect(img.src).toContain('data:image/svg+xml');
      expect(img.src).toContain('svg');
    });
  });
});
