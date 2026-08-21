import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    fixture.componentRef.setInput('label', 'Click Me');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Click Me');
  });

  it('should apply primary variant class by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.classList.contains('btn--primary')).toBeTrue();
  });

  it('should apply correct variant class', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.classList.contains('btn--danger')).toBeTrue();
  });

  it('should apply correct size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.classList.contains('btn--lg')).toBeTrue();
  });

  it('should disable button when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('should disable button when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('should apply loading class when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.classList.contains('btn--loading')).toBeTrue();
  });

  it('should show spinner when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn__spinner')).toBeTruthy();
  });

  it('should show icon when provided and not loading', () => {
    fixture.componentRef.setInput('icon', '🗑️');
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn__icon')?.textContent).toContain('🗑️');
  });

  it('should hide icon when loading', () => {
    fixture.componentRef.setInput('icon', '🗑️');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn__icon')).toBeFalsy();
  });

  it('should set aria-label', () => {
    fixture.componentRef.setInput('ariaLabel', 'Delete button');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Delete button');
  });

  it('should set aria-busy when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.getAttribute('aria-busy')).toBe('true');
  });

  it('should have type button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('button');
    expect(btn?.getAttribute('type')).toBe('button');
  });
});
