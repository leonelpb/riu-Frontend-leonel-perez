import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HeroFormComponent } from './hero-form.component';
import { createMockHero } from '../testing/mock-heroes';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HeroFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State (Create Mode)', () => {
    it('should have an empty form', () => {
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('image')?.value).toBe('');
      expect(component.form.get('description')?.value).toBe('');
      expect(component.form.get('publisher')?.value).toBe('');
      expect(component.form.get('alignment')?.value).toBe('');
    });

    it('should have form invalid initially', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('should have default submitLabel', () => {
      expect(component.submitLabel).toBe('Save');
    });

    it('should have submitting as false', () => {
      expect(component.submitting).toBeFalse();
    });
  });

  describe('Initial State (Edit Mode)', () => {
    beforeEach(() => {
      const hero = createMockHero({
        name: 'Edit Hero',
        description: 'Edit description for testing',
        image: 'https://example.com/edit.jpg',
        publisher: 'Edit Publisher',
        alignment: 'bad',
      });
      component.hero = hero;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should populate form with hero data', () => {
      expect(component.form.get('name')?.value).toBe('Edit Hero');
      expect(component.form.get('image')?.value).toBe('https://example.com/edit.jpg');
      expect(component.form.get('description')?.value).toBe('Edit description for testing');
      expect(component.form.get('publisher')?.value).toBe('Edit Publisher');
      expect(component.form.get('alignment')?.value).toBe('bad');
    });
  });

  describe('OnChanges', () => {
    it('should re-populate form when hero input changes', () => {
      const hero = createMockHero({
        name: 'Changed Hero',
        description: 'A new description for testing',
        image: 'https://example.com/changed.jpg',
      });
      component.hero = hero;
      component.ngOnChanges({
        hero: { currentValue: hero, previousValue: null, firstChange: true, isFirstChange: () => true },
      });
      fixture.detectChanges();

      expect(component.form.get('name')?.value).toBe('Changed Hero');
    });
  });

  describe('Name Validation', () => {
    it('should be invalid when empty', () => {
      component.form.get('name')?.setValue('');
      expect(component.form.get('name')?.valid).toBeFalse();
      expect(component.form.get('name')?.errors?.['required']).toBeTruthy();
    });

    it('should be invalid when too short', () => {
      component.form.get('name')?.setValue('A');
      expect(component.form.get('name')?.valid).toBeFalse();
      expect(component.form.get('name')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when too long', () => {
      component.form.get('name')?.setValue('A'.repeat(101));
      expect(component.form.get('name')?.valid).toBeFalse();
      expect(component.form.get('name')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with proper name', () => {
      component.form.get('name')?.setValue('Superman');
      expect(component.form.get('name')?.valid).toBeTrue();
    });
  });

  describe('Image Validation', () => {
    it('should be invalid when empty', () => {
      component.form.get('image')?.setValue('');
      expect(component.form.get('image')?.errors?.['required']).toBeTruthy();
    });

    it('should be invalid with non-url value', () => {
      component.form.get('image')?.setValue('not-a-url');
      expect(component.form.get('image')?.errors?.['pattern']).toBeTruthy();
    });

    it('should be valid with proper URL', () => {
      component.form.get('image')?.setValue('https://example.com/hero.jpg');
      expect(component.form.get('image')?.valid).toBeTrue();
    });

    it('should accept http URLs', () => {
      component.form.get('image')?.setValue('http://example.com/hero.png');
      expect(component.form.get('image')?.valid).toBeTrue();
    });

    it('should accept URLs with query params', () => {
      component.form.get('image')?.setValue('https://example.com/hero.jpg?size=large');
      expect(component.form.get('image')?.valid).toBeTrue();
    });
  });

  describe('Description Validation', () => {
    it('should be invalid when empty', () => {
      component.form.get('description')?.setValue('');
      expect(component.form.get('description')?.errors?.['required']).toBeTruthy();
    });

    it('should be invalid when too short', () => {
      component.form.get('description')?.setValue('Short');
      expect(component.form.get('description')?.valid).toBeFalse();
      expect(component.form.get('description')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when too long', () => {
      component.form.get('description')?.setValue('A'.repeat(501));
      expect(component.form.get('description')?.valid).toBeFalse();
      expect(component.form.get('description')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with proper description', () => {
      component.form.get('description')?.setValue('A valid description for testing');
      expect(component.form.get('description')?.valid).toBeTrue();
    });
  });

  describe('Submit', () => {
    it('should emit submitForm with valid data', () => {
      spyOn(component.submitForm, 'emit');

      component.form.patchValue({
        name: 'New Hero',
        image: 'https://example.com/new.jpg',
        description: 'A brand new hero for testing purposes',
      });

      component.onSubmit();

      expect(component.submitForm.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'New Hero',
          image: 'https://example.com/new.jpg',
          description: 'A brand new hero for testing purposes',
          publisher: '',
          alignment: 'neutral',
        })
      );
    });

    it('should not emit submitForm when form is invalid', () => {
      spyOn(component.submitForm, 'emit');

      component.form.get('name')?.setValue('');
      component.onSubmit();

      expect(component.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submit', () => {
      component.onSubmit();

      expect(component.form.get('name')?.touched).toBeTrue();
      expect(component.form.get('image')?.touched).toBeTrue();
      expect(component.form.get('description')?.touched).toBeTrue();
    });

    it('should trim whitespace from values', () => {
      spyOn(component.submitForm, 'emit');

      component.form.patchValue({
        name: '  Trimmed Hero  ',
        image: 'https://example.com/trimmed.jpg',
        description: '  A trimmed description for testing  ',
      });

      component.onSubmit();

      expect(component.submitForm.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Trimmed Hero',
          description: 'A trimmed description for testing',
          image: 'https://example.com/trimmed.jpg',
        })
      );
    });

    it('should use hero firstAppearance when in edit mode', () => {
      const hero = createMockHero({
        name: 'Edit',
        description: 'Edit description for testing',
        image: 'https://example.com/edit.jpg',
        firstAppearance: 'Issue #1',
      });
      component.hero = hero;
      component.ngOnInit();
      fixture.detectChanges();

      spyOn(component.submitForm, 'emit');

      component.onSubmit();

      expect(component.submitForm.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          firstAppearance: 'Issue #1',
        })
      );
    });
  });

  describe('Cancel', () => {
    it('should emit cancel event', () => {
      spyOn(component.cancel, 'emit');
      component.cancel.emit();
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should show error for name when touched and empty', () => {
      const nameControl = component.form.get('name')!;
      nameControl.setValue('');
      nameControl.markAsTouched();
      fixture.detectChanges();

      expect(component.isFieldInvalid('name')).toBeTrue();
    });

    it('should not show error for name when pristine', () => {
      expect(component.isFieldInvalid('name')).toBeFalse();
    });

    it('should not show error for name when valid', () => {
      const nameControl = component.form.get('name')!;
      nameControl.setValue('Superman');
      nameControl.markAsTouched();
      fixture.detectChanges();

      expect(component.isFieldInvalid('name')).toBeFalse();
    });

    it('should show error in DOM for invalid name', () => {
      const nameControl = component.form.get('name')!;
      nameControl.setValue('');
      nameControl.markAsTouched();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorEl = compiled.querySelector('.hero-form__error');
      expect(errorEl?.textContent).toContain('Name is required');
    });
  });

  describe('DOM rendering', () => {
    it('should render form fields', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('#hero-name')).toBeTruthy();
      expect(compiled.querySelector('#hero-image')).toBeTruthy();
      expect(compiled.querySelector('#hero-description')).toBeTruthy();
      expect(compiled.querySelector('#hero-publisher')).toBeTruthy();
      expect(compiled.querySelector('#hero-alignment')).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitBtn = compiled.querySelector('[type="submit"]') as HTMLButtonElement;
      expect(submitBtn.disabled).toBeTrue();
    });

    it('should show character count for description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-form__char-count')?.textContent).toContain('0 / 500');
    });

    it('should update character count when typing', () => {
      component.form.get('description')?.setValue('Hello World');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero-form__char-count')?.textContent).toContain('11 / 500');
    });
  });
});
