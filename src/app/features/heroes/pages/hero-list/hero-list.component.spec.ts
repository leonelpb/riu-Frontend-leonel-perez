import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../services/hero.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MOCK_HEROES } from '../../testing/mock-heroes';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const heroSpy = jasmine.createSpyObj('HeroService', ['getAll', 'getById', 'searchByName', 'delete']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

    heroSpy.getAll.and.returnValue(of(MOCK_HEROES));
    heroSpy.searchByName.and.returnValue(of(MOCK_HEROES));

    await TestBed.configureTestingModule({
      imports: [HeroListComponent],
      providers: [
        { provide: HeroService, useValue: heroSpy },
        { provide: ToastService, useValue: toastSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial Load', () => {
    it('should load heroes on init', () => {
      fixture.detectChanges();

      expect(heroService.getAll).toHaveBeenCalled();
      expect(component.heroes().length).toBe(MOCK_HEROES.length);
    });

    it('should set loading to false after load', () => {
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should show error state when load fails', () => {
      heroService.getAll.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();

      expect(component.error()).toBeTrue();
      expect(component.loading()).toBeFalse();
    });

    it('should have pageSize of 18', () => {
      expect(component.pageSize).toBe(18);
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter heroes by search term', fakeAsync(() => {
      component.onSearchTermChange('batman');
      tick(350);

      expect(component.searchTerm()).toBe('batman');
      expect(component.filteredHeroes().every((h) => h.name.toLowerCase().includes('batman'))).toBeTrue();
    }));

    it('should show all heroes when search is cleared', fakeAsync(() => {
      component.onSearchTermChange('batman');
      tick(350);

      component.onSearchTermChange('');
      tick(350);

      expect(component.filteredHeroes().length).toBe(MOCK_HEROES.length);
    }));

    it('should reset to page 1 when search changes', fakeAsync(() => {
      component.currentPage.set(3);
      component.onSearchTermChange('test');
      tick(350);

      expect(component.currentPage()).toBe(1);
    }));

    it('should debounce search input', fakeAsync(() => {
      component.onSearchTermChange('b');
      component.onSearchTermChange('ba');
      component.onSearchTermChange('bat');
      tick(350);

      expect(component.searchTerm()).toBe('bat');
    }));

    it('should not update search if same term is emitted twice', fakeAsync(() => {
      component.onSearchTermChange('batman');
      tick(350);

      component.onSearchTermChange('batman');
      tick(350);

      expect(component.searchTerm()).toBe('batman');
    }));
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have correct page size', () => {
      expect(component.pageSize).toBeGreaterThan(0);
    });

    it('should paginate heroes', () => {
      const total = component.filteredHeroes().length;
      if (total > component.pageSize) {
        expect(component.paginatedHeroes().length).toBe(component.pageSize);
      }
    });

    it('should change page', () => {
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
    });

    it('should compute paginatedHeroes correctly', () => {
      component.currentPage.set(1);
      expect(component.paginatedHeroes().length).toBeLessThanOrEqual(component.pageSize);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no heroes match search', fakeAsync(() => {
      fixture.detectChanges();

      component.onSearchTermChange('zzzznotfound');
      tick(350);

      expect(component.filteredHeroes().length).toBe(0);
    }));
  });

  describe('Delete Flow', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open delete confirm dialog', () => {
      const hero = MOCK_HEROES[0];
      component.onDeleteRequest(hero);

      expect(component.showDeleteConfirm).toBeTrue();
      expect(component.heroToDelete()?.id).toBe(hero.id);
    });

    it('should close dialog and reset on cancel', () => {
      component.onDeleteRequest(MOCK_HEROES[0]);
      component.onDeleteConfirm(false);

      expect(component.showDeleteConfirm).toBeFalse();
      expect(component.heroToDelete()).toBeNull();
    });

    it('should delete hero on confirm', () => {
      heroService.delete.and.returnValue(of(true));
      component.onDeleteRequest(MOCK_HEROES[0]);
      component.onDeleteConfirm(true);

      expect(heroService.delete).toHaveBeenCalledWith(MOCK_HEROES[0].id);
    });

    it('should remove hero from list after delete', () => {
      heroService.delete.and.returnValue(of(true));
      component.onDeleteRequest(MOCK_HEROES[0]);
      component.onDeleteConfirm(true);

      expect(component.heroes().some((h) => h.id === MOCK_HEROES[0].id)).toBeFalse();
    });

    it('should show toast on successful delete', () => {
      heroService.delete.and.returnValue(of(true));
      component.onDeleteRequest(MOCK_HEROES[0]);
      component.onDeleteConfirm(true);

      expect(toastService.success).toHaveBeenCalledWith('Hero deleted successfully!');
    });

    it('should show toast on failed delete', () => {
      heroService.delete.and.returnValue(throwError(() => new Error('fail')));
      component.onDeleteRequest(MOCK_HEROES[0]);
      component.onDeleteConfirm(true);

      expect(toastService.error).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to new hero page', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.navigateToNew();
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes', 'new']);
    });

    it('should navigate to edit page', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.navigateToEdit(MOCK_HEROES[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes', MOCK_HEROES[0].id, 'edit']);
    });
  });

  describe('Reload', () => {
    it('should reload heroes on loadHeroes call', () => {
      fixture.detectChanges();
      heroService.getAll.calls.reset();

      component.loadHeroes();

      expect(heroService.getAll).toHaveBeenCalled();
    });
  });
});
