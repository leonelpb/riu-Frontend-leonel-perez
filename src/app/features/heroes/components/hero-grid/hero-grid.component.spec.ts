import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroGridComponent } from './hero-grid.component';
import { MOCK_HEROES, createMockHero } from '../../testing/mock-heroes';

describe('HeroGridComponent', () => {
  let component: HeroGridComponent;
  let fixture: ComponentFixture<HeroGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero cards for each hero', () => {
    component.heroes = MOCK_HEROES;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-hero-card');
    expect(cards.length).toBe(MOCK_HEROES.length);
  });

  it('should render empty grid when no heroes', () => {
    component.heroes = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-hero-card');
    expect(cards.length).toBe(0);
  });

  it('should pass showActions to hero cards', () => {
    component.heroes = [createMockHero()];
    component.showActions = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-hero-card')).toBeTruthy();
  });

  it('should have region role for accessibility', () => {
    component.heroes = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="region"]')).toBeTruthy();
  });

  it('should have aria-label for accessibility', () => {
    component.heroes = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[aria-label="Heroes grid"]')).toBeTruthy();
  });

  it('should emit viewHero from card', () => {
    spyOn(component.viewHero, 'emit');
    const hero = createMockHero();
    component.viewHero.emit(hero);
    expect(component.viewHero.emit).toHaveBeenCalledWith(hero);
  });

  it('should emit editHero from card', () => {
    spyOn(component.editHero, 'emit');
    const hero = createMockHero();
    component.editHero.emit(hero);
    expect(component.editHero.emit).toHaveBeenCalledWith(hero);
  });

  it('should emit deleteHero from card', () => {
    spyOn(component.deleteHero, 'emit');
    const hero = createMockHero();
    component.deleteHero.emit(hero);
    expect(component.deleteHero.emit).toHaveBeenCalledWith(hero);
  });

  it('should pin hero on card click', () => {
    component.heroes = MOCK_HEROES;
    fixture.detectChanges();

    component.onCardClick(MOCK_HEROES[0]);
    expect(component.pinnedHero()?.id).toBe(MOCK_HEROES[0].id);
  });

  it('should unpin hero on second click', () => {
    component.heroes = MOCK_HEROES;
    fixture.detectChanges();

    component.onCardClick(MOCK_HEROES[0]);
    component.onCardClick(MOCK_HEROES[0]);
    expect(component.pinnedHero()).toBeNull();
  });

  it('should switch pinned hero on different card click', () => {
    component.heroes = MOCK_HEROES;
    fixture.detectChanges();

    component.onCardClick(MOCK_HEROES[0]);
    component.onCardClick(MOCK_HEROES[1]);
    expect(component.pinnedHero()?.id).toBe(MOCK_HEROES[1].id);
  });

  it('should compute hero rows from heroes list', () => {
    component.heroes = MOCK_HEROES;
    fixture.detectChanges();

    const rows = component.heroRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].length).toBe(8);
  });

  it('should compute hero rows for small list', () => {
    component.heroes = MOCK_HEROES.slice(0, 3);
    fixture.detectChanges();

    const rows = component.heroRows();
    expect(rows.length).toBe(1);
    expect(rows[0].length).toBe(3);
  });

  // --- panelMode tests ---

  describe('panelMode', () => {
    beforeEach(() => {
      component.heroes = MOCK_HEROES;
      component.panelMode = true;
      fixture.detectChanges();
    });

    it('should emit heroSelect with hero on card click in panel mode', () => {
      spyOn(component.heroSelect, 'emit');
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.heroSelect.emit).toHaveBeenCalledWith(MOCK_HEROES[0]);
    });

    it('should emit null when clicking same selected hero in panel mode', () => {
      spyOn(component.heroSelect, 'emit');
      component.externalSelectedHero = MOCK_HEROES[0];
      component.onCardClick(MOCK_HEROES[0]);
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.heroSelect.emit).toHaveBeenCalledWith(null);
    });

    it('should use externalSelectedHero for getSelected in panel mode', () => {
      component.externalSelectedHero = MOCK_HEROES[0];
      expect(component.getSelected(MOCK_HEROES[0])).toBeTrue();
      expect(component.getSelected(MOCK_HEROES[1])).toBeFalse();
    });

    it('should dim non-selected heroes in panel mode', () => {
      component.externalSelectedHero = MOCK_HEROES[0];
      expect(component.getDimmed(MOCK_HEROES[0])).toBeFalse();
      expect(component.getDimmed(MOCK_HEROES[1])).toBeTrue();
    });

    it('should not dim any hero when no external selection', () => {
      component.externalSelectedHero = null;
      expect(component.getDimmed(MOCK_HEROES[0])).toBeFalse();
    });

    it('should not pin hero in panel mode', () => {
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.pinnedHero()).toBeNull();
    });

    it('should return hasSelection from external hero in panel mode', () => {
      component.externalSelectedHero = MOCK_HEROES[0];
      expect(component.hasSelection).toBeTrue();
    });

    it('should return false hasSelection when no external hero in panel mode', () => {
      component.externalSelectedHero = null;
      expect(component.hasSelection).toBeFalse();
    });
  });

  // --- hover tests ---

  describe('hover', () => {
    beforeEach(() => {
      component.heroes = MOCK_HEROES;
      component.panelMode = false;
      fixture.detectChanges();
    });

    it('should set hoveredHero on card hover', () => {
      component.onCardHover(MOCK_HEROES[0]);
      expect(component.hoveredHero()?.id).toBe(MOCK_HEROES[0].id);
    });

    it('should clear hoveredHero on card leave', () => {
      component.onCardHover(MOCK_HEROES[0]);
      component.onCardLeave();
      expect(component.hoveredHero()).toBeNull();
    });

    it('should not set hoveredHero when pinned', () => {
      component.onCardClick(MOCK_HEROES[0]);
      component.onCardHover(MOCK_HEROES[1]);
      expect(component.hoveredHero()).toBeNull();
    });

    it('should not clear hoveredHero on leave when pinned', () => {
      component.onCardHover(MOCK_HEROES[0]);
      component.onCardClick(MOCK_HEROES[0]);
      component.onCardLeave();
      // hoveredHero stays null because pin cleared it
      expect(component.pinnedHero()).toBeTruthy();
    });

    it('should not set hoveredHero in panelMode', () => {
      component.panelMode = true;
      component.onCardHover(MOCK_HEROES[0]);
      expect(component.hoveredHero()).toBeNull();
    });

    it('should not clear hoveredHero in panelMode', () => {
      component.panelMode = true;
      component.onCardLeave();
      expect(component.hoveredHero()).toBeNull();
    });
  });

  // --- selection helpers ---

  describe('getSelected / getDimmed in non-panelMode', () => {
    beforeEach(() => {
      component.heroes = MOCK_HEROES;
      component.panelMode = false;
      fixture.detectChanges();
    });

    it('should use pinnedHero for getSelected', () => {
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.getSelected(MOCK_HEROES[0])).toBeTrue();
      expect(component.getSelected(MOCK_HEROES[1])).toBeFalse();
    });

    it('should dim non-pinned heroes', () => {
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.getDimmed(MOCK_HEROES[0])).toBeFalse();
      expect(component.getDimmed(MOCK_HEROES[1])).toBeTrue();
    });

    it('should not dim any hero when no pin', () => {
      expect(component.getDimmed(MOCK_HEROES[0])).toBeFalse();
    });
  });

  // --- document click ---

  describe('onDocumentClick', () => {
    beforeEach(() => {
      component.heroes = MOCK_HEROES;
      component.panelMode = false;
      fixture.detectChanges();
    });

    it('should not unpin in panelMode', () => {
      component.panelMode = true;
      component.onCardClick(MOCK_HEROES[0]);
      component.onDocumentClick(new MouseEvent('click'));
      expect(component.pinnedHero()).toBeNull(); // panelMode skips the unpin logic
    });

    it('should unpin when clicking outside hero-card and overlay', () => {
      component.onCardClick(MOCK_HEROES[0]);
      const fakeEvent = { target: document.createElement('div') } as unknown as MouseEvent;
      component.onDocumentClick(fakeEvent);
      expect(component.pinnedHero()).toBeNull();
    });
  });

  // --- keyboard navigation ---

  describe('keyboard navigation', () => {
    beforeEach(() => {
      component.heroes = MOCK_HEROES;
      component.isDesktop = true;
      component.panelMode = false;
      fixture.detectChanges();
    });

    it('should not navigate when isDesktop is false', () => {
      component.isDesktop = false;
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0); // default
    });

    it('should not navigate when target is INPUT', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      Object.defineProperty(event, 'target', { value: document.createElement('input') });
      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should not navigate when target is TEXTAREA', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      Object.defineProperty(event, 'target', { value: document.createElement('textarea') });
      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should not navigate when target is SELECT', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      Object.defineProperty(event, 'target', { value: document.createElement('select') });
      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should navigate right with ArrowRight', () => {
      component.focusedIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(1);
    });

    it('should not go beyond heroes length', () => {
      component.focusedIndex.set(MOCK_HEROES.length - 1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(MOCK_HEROES.length - 1);
    });

    it('should navigate left with ArrowLeft', () => {
      component.focusedIndex.set(1);
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should not go below 0 with ArrowLeft', () => {
      component.focusedIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(0);
    });

    it('should handle Escape in non-panelMode to clear pin', () => {
      component.onCardClick(MOCK_HEROES[0]);
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(event);
      expect(component.pinnedHero()).toBeNull();
    });

    it('should handle Escape in panelMode with externalSelectedHero', () => {
      spyOn(component.heroSelect, 'emit');
      component.panelMode = true;
      component.externalSelectedHero = MOCK_HEROES[0];
      const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      component.onKeyDown(event);
      expect(component.heroSelect.emit).toHaveBeenCalledWith(null);
    });

    it('should handle Escape to go back to previousFocusedIndex', () => {
      component.focusedIndex.set(5);
      component['previousFocusedIndex'] = 2;
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(event);
      expect(component.focusedIndex()).toBe(2);
    });

    it('should emit heroSelect on Enter when focused', () => {
      spyOn(component.heroSelect, 'emit');
      spyOn(component.viewHero, 'emit');
      component.focusedIndex.set(0);
      component.onCardClick = jasmine.createSpy('onCardClick');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(event);
      expect(component.viewHero.emit).toHaveBeenCalledWith(MOCK_HEROES[0]);
    });

    it('should emit heroSelect on Space when focused', () => {
      spyOn(component.heroSelect, 'emit');
      spyOn(component.viewHero, 'emit');
      component.focusedIndex.set(0);
      component.onCardClick = jasmine.createSpy('onCardClick');
      const event = new KeyboardEvent('keydown', { key: ' ' });

      component.onKeyDown(event);
      expect(component.viewHero.emit).toHaveBeenCalledWith(MOCK_HEROES[0]);
    });

    it('should not fire Enter/Space when defaultPrevented', () => {
      spyOn(component.viewHero, 'emit');
      component.focusedIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
      event.preventDefault();
      component.onKeyDown(event);
      expect(component.viewHero.emit).not.toHaveBeenCalled();
    });
  });

  // --- ngOnChanges ---

  describe('ngOnChanges', () => {
    it('should clear pinned hero if it no longer exists in heroes list', () => {
      component.heroes = MOCK_HEROES;
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.pinnedHero()?.id).toBe(MOCK_HEROES[0].id);

      component.heroes = MOCK_HEROES.slice(1); // Batman removed
      component.ngOnChanges({
        heroes: {
          currentValue: MOCK_HEROES.slice(1),
          previousValue: MOCK_HEROES,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.pinnedHero()).toBeNull();
    });

    it('should clear hoveredHero and pinnedHero on panelMode change', () => {
      component.heroes = MOCK_HEROES;
      component.onCardClick(MOCK_HEROES[0]);
      component.onCardHover(MOCK_HEROES[1]);

      component.panelMode = true;
      component.ngOnChanges({
        panelMode: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false },
      });
      expect(component.hoveredHero()).toBeNull();
      expect(component.pinnedHero()).toBeNull();
    });
  });

  // --- row helpers ---

  describe('isLastTwoRows', () => {
    it('should return true for last two rows', () => {
      component.heroes = MOCK_HEROES;
      fixture.detectChanges();
      const rows = component.heroRows();
      expect(component.isLastTwoRows(rows.length - 1)).toBeTrue();
      expect(component.isLastTwoRows(rows.length - 2)).toBeTrue();
    });

    it('should return false for rows not in last two', () => {
      // 18 heroes → rows [8,6,4] = 3 rows → row 0 is not in last two
      const manyHeroes = Array.from({ length: 18 }, (_, i) => createMockHero({ id: i + 1, name: `Hero ${i + 1}` }));
      component.heroes = manyHeroes;
      fixture.detectChanges();
      expect(component.isLastTwoRows(0)).toBeFalse();
    });
  });

  describe('isUniformLastTwoRows', () => {
    it('should return false when hero index is in first row', () => {
      // 18 heroes, cols=6 (Chrome default) → 3 rows → index 0 is in first row
      const manyHeroes = Array.from({ length: 18 }, (_, i) => createMockHero({ id: i + 1, name: `Hero ${i + 1}` }));
      component.heroes = manyHeroes;
      fixture.detectChanges();
      expect(component.isUniformLastTwoRows(0)).toBeFalse();
    });

    it('should return true when hero index is in last row', () => {
      // 18 heroes, cols=6 → 3 rows → index 16 is in row 2 (last row)
      const manyHeroes = Array.from({ length: 18 }, (_, i) => createMockHero({ id: i + 1, name: `Hero ${i + 1}` }));
      component.heroes = manyHeroes;
      fixture.detectChanges();
      expect(component.isUniformLastTwoRows(16)).toBeTrue();
    });
  });

  // --- getFlatIndex ---

  describe('getFlatIndex', () => {
    it('should compute correct flat index from row and column', () => {
      component.heroes = MOCK_HEROES;
      fixture.detectChanges();
      // First row: 8 heroes → row 0, col 0 = flat 0; row 0, col 5 = flat 5
      expect(component.getFlatIndex(0, 5)).toBe(5);
      // Second row starts at index 8 → row 1, col 0 = flat 8
      expect(component.getFlatIndex(1, 0)).toBe(8);
    });
  });

  // --- isFocused ---

  describe('isFocused', () => {
    it('should return true when focusedIndex matches', () => {
      component.focusedIndex.set(3);
      expect(component.isFocused(3)).toBeTrue();
      expect(component.isFocused(2)).toBeFalse();
    });
  });

  // --- gamepadNavigationActive ---

  describe('gamepadNavigationActive', () => {
    it('should return true when focusedIndex >= 0', () => {
      component.focusedIndex.set(0);
      expect(component.gamepadNavigationActive).toBeTrue();
    });
  });

  // --- hasSelection non-panel ---

  describe('hasSelection non-panelMode', () => {
    it('should return true when pinnedHero is set', () => {
      component.panelMode = false;
      component.onCardClick(MOCK_HEROES[0]);
      expect(component.hasSelection).toBeTrue();
    });

    it('should return false when no pinnedHero', () => {
      component.panelMode = false;
      expect(component.hasSelection).toBeFalse();
    });
  });
});
