import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { HeroEditComponent } from './hero-edit.component';
import { HeroService } from '../../services/hero.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MOCK_SINGLE_HERO } from '../../testing/mock-heroes';

describe('HeroEditComponent', () => {
  let component: HeroEditComponent;
  let fixture: ComponentFixture<HeroEditComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let paramMap$: BehaviorSubject<any>;

  beforeEach(async () => {
    const heroSpy = jasmine.createSpyObj('HeroService', ['getById', 'update']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    heroSpy.getById.and.returnValue(of(MOCK_SINGLE_HERO));
    heroSpy.update.and.returnValue(of({ ...MOCK_SINGLE_HERO, name: 'Updated' }));

    paramMap$ = new BehaviorSubject({ get: (key: string) => (key === 'id' ? '70' : null) });

    await TestBed.configureTestingModule({
      imports: [HeroEditComponent],
      providers: [
        { provide: HeroService, useValue: heroSpy },
        { provide: ToastService, useValue: toastSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroEditComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load hero by id from route', () => {
      fixture.detectChanges();

      expect(heroService.getById).toHaveBeenCalledWith('70');
      expect(component.hero()?.name).toBe('Batman');
    });

    it('should set loading to false after hero loads', () => {
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
    });

    it('should set hero to null and loading to false on error', () => {
      heroService.getById.and.returnValue(throwError(() => new Error('not found')));
      paramMap$.next({ get: (key: string) => (key === 'id' ? '99999' : null) });

      fixture.detectChanges();

      expect(component.hero()).toBeNull();
      expect(component.loading()).toBeFalse();
    });

    it('should show hero name in subtitle', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editing');
      expect(compiled.textContent).toContain('Batman');
    });
  });

  describe('onSubmit', () => {
    it('should update hero and navigate', () => {
      fixture.detectChanges();

      const navigateSpy = spyOn(component['router'], 'navigate');
      component.onSubmit({
        name: 'Updated Batman',
        description: 'Updated',
        image: 'https://example.com/updated.jpg',
      } as any);

      expect(heroService.update).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith('Hero updated successfully!');
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
    });

    it('should show error toast on update failure', () => {
      heroService.update.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();

      component.onSubmit({ name: 'Test', description: 'desc', image: 'https://example.com/img.jpg' } as any);

      expect(toastService.error).toHaveBeenCalledWith('Failed to update hero. Please try again.');
    });

    it('should not update if no hero is loaded', () => {
      component.hero.set(null);
      component.onSubmit({ name: 'Test', description: 'desc', image: 'https://example.com/img.jpg' } as any);

      expect(heroService.update).not.toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should navigate to heroes list', () => {
      fixture.detectChanges();
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('DOM states', () => {
    it('should show loading state', () => {
      // Prevent ngOnInit from loading hero
      heroService.getById.and.returnValue(of(null));
      paramMap$.next({ get: () => null });

      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.spinner')).toBeTruthy();
    });

    it('should show error state when no hero', () => {
      heroService.getById.and.returnValue(of(null));
      paramMap$.next({ get: () => null });

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.error-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Hero not found');
    });
  });
});
