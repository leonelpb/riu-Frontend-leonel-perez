import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HeroCreateComponent } from './hero-create.component';
import { HeroService } from '../../services/hero.service';
import { ToastService } from '../../../../core/services/toast.service';
import { createMockHero } from '../../testing/mock-heroes';

describe('HeroCreateComponent', () => {
  let component: HeroCreateComponent;
  let fixture: ComponentFixture<HeroCreateComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const heroSpy = jasmine.createSpyObj('HeroService', ['getAll', 'create']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    heroSpy.create.and.returnValue(of(createMockHero()));

    await TestBed.configureTestingModule({
      imports: [HeroCreateComponent],
      providers: [
        { provide: HeroService, useValue: heroSpy },
        { provide: ToastService, useValue: toastSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroCreateComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the create form', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-create-page')).toBeTruthy();
    expect(compiled.textContent).toContain('Create New Hero');
  });

  describe('onSubmit', () => {
    it('should create hero and navigate to list', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      const heroData = { name: 'New Hero', description: 'A new hero', image: 'https://example.com/new.jpg' };

      component.onSubmit(heroData as any);

      expect(heroService.create).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith('Hero created successfully!');
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
    });

    it('should set submitting to true during creation', () => {
      heroService.create.and.returnValue(of(createMockHero()));
      component.onSubmit({ name: 'Test', description: 'desc', image: 'https://example.com/img.jpg' } as any);

      // After subscribe completes synchronously, it should be false again
      expect(component.submitting()).toBeFalse();
    });

    it('should show error toast on creation failure', () => {
      heroService.create.and.returnValue(throwError(() => new Error('fail')));
      component.onSubmit({ name: 'Test', description: 'desc', image: 'https://example.com/img.jpg' } as any);

      expect(toastService.error).toHaveBeenCalledWith('Failed to create hero. Please try again.');
    });

    it('should reset submitting on error', () => {
      heroService.create.and.returnValue(throwError(() => new Error('fail')));
      component.onSubmit({ name: 'Test', description: 'desc', image: 'https://example.com/img.jpg' } as any);

      expect(component.submitting()).toBeFalse();
    });
  });

  describe('goBack', () => {
    it('should navigate to heroes list', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/heroes']);
    });
  });
});
