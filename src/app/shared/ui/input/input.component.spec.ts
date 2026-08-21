import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.label).toBe('');
    expect(component.placeholder).toBe('');
    expect(component.type).toBe('text');
    expect(component.disabled).toBeFalse();
    expect(component.hasError).toBeFalse();
    expect(component.errorMessage).toBe('');
    expect(component.prefix).toBe('');
    expect(component.suffix).toBe('');
    expect(component.uppercase).toBeFalse();
  });

  describe('writeValue', () => {
    it('should set value', () => {
      component.writeValue('hello');
      expect(component.value).toBe('hello');
    });

    it('should handle null value', () => {
      component.writeValue(null as any);
      expect(component.value).toBe('');
    });

    it('should handle undefined value', () => {
      component.writeValue(undefined as any);
      expect(component.value).toBe('');
    });
  });

  describe('onValueChange', () => {
    it('should update value and emit change', () => {
      const spy = jasmine.createSpy('onChange');
      component.registerOnChange(spy);

      component.onValueChange('new value');

      expect(component.value).toBe('new value');
      expect(spy).toHaveBeenCalledWith('new value');
    });

    it('should emit valueChange event', () => {
      spyOn(component.valueChange, 'emit');
      component.onValueChange('test');
      expect(component.valueChange.emit).toHaveBeenCalledWith('test');
    });

    it('should uppercase value when uppercase is true', () => {
      const spy = jasmine.createSpy('onChange');
      component.registerOnChange(spy);
      spyOn(component.valueChange, 'emit');
      component.uppercase = true;

      component.onValueChange('batman');

      expect(component.value).toBe('BATMAN');
      expect(spy).toHaveBeenCalledWith('BATMAN');
      expect(component.valueChange.emit).toHaveBeenCalledWith('BATMAN');
    });

    it('should not uppercase when uppercase is false', () => {
      const spy = jasmine.createSpy('onChange');
      component.registerOnChange(spy);
      component.uppercase = false;

      component.onValueChange('batman');

      expect(component.value).toBe('batman');
      expect(spy).toHaveBeenCalledWith('batman');
    });
  });

  describe('setDisabledState', () => {
    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
    });

    it('should enable when set to false', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);
      expect(component.disabled).toBeFalse();
    });
  });

  describe('onTouched', () => {
    it('should call registered onTouched', () => {
      const spy = jasmine.createSpy('onTouched');
      component.registerOnTouched(spy);
      component.onTouched();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('DOM rendering', () => {
    it('should render input element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('input')).toBeTruthy();
    });

    it('should render label when provided', () => {
      component.label = 'Name';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('label')?.textContent).toContain('Name');
    });

    it('should not render label when not provided', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('label')).toBeFalsy();
    });

    it('should render prefix when provided', () => {
      component.prefix = '🔍';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__prefix')?.textContent).toContain('🔍');
    });

    it('should render suffix when provided', () => {
      component.suffix = 'kg';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__suffix')?.textContent).toContain('kg');
    });

    it('should render error message when hasError is true', () => {
      component.hasError = true;
      component.errorMessage = 'This field is required';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__error')?.textContent).toContain('This field is required');
    });

    it('should not render error when hasError is false', () => {
      component.hasError = false;
      component.errorMessage = 'Error';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__error')).toBeFalsy();
    });

    it('should set placeholder on input', () => {
      component.placeholder = 'Enter text';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter text');
    });

    it('should set input type', () => {
      component.type = 'password';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should apply disabled wrapper class when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input-container--disabled')).toBeTruthy();
    });

    it('should set aria-invalid when hasError', () => {
      component.hasError = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const input = compiled.querySelector('input');
      expect(input?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should apply error wrapper class', () => {
      component.hasError = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input-container--error')).toBeTruthy();
    });

    it('should apply disabled wrapper class', () => {
      component.disabled = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input-container--disabled')).toBeTruthy();
    });

    it('should apply uppercase class when uppercase is true', () => {
      component.uppercase = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__field--uppercase')).toBeTruthy();
    });

    it('should not apply uppercase class when uppercase is false', () => {
      component.uppercase = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.input__field--uppercase')).toBeFalsy();
    });
  });
});
