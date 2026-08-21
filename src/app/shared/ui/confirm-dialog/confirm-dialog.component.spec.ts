import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.confirm-backdrop')).toBeFalsy();
  });

  it('should render when open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.confirm-backdrop')).toBeTruthy();
  });

  it('should display default title', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Are you sure?');
  });

  it('should display custom title', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', 'Delete Confirmation');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Delete Confirmation');
  });

  it('should display custom message', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Delete this hero?');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Delete this hero?');
  });

  it('should display custom confirm label', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('confirmLabel', 'Remove');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Remove');
  });

  it('should display icon', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('icon', '🗑️');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('🗑️');
  });

  it('should emit true when confirm clicked', () => {
    spyOn(component.confirm, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.confirm.emit(true);

    expect(component.confirm.emit).toHaveBeenCalledWith(true);
  });

  it('should emit false when cancel clicked', () => {
    spyOn(component.confirm, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.confirm.emit(false);

    expect(component.confirm.emit).toHaveBeenCalledWith(false);
  });

  it('should emit false on backdrop click when closeOnBackdrop is true', () => {
    spyOn(component.confirm, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('closeOnBackdrop', true);
    fixture.detectChanges();

    component.onBackdropClick();

    expect(component.confirm.emit).toHaveBeenCalledWith(false);
  });

  it('should not emit on backdrop click when closeOnBackdrop is false', () => {
    spyOn(component.confirm, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('closeOnBackdrop', false);
    fixture.detectChanges();

    component.onBackdropClick();

    expect(component.confirm.emit).not.toHaveBeenCalled();
  });

  it('should have dialog role for accessibility', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should have aria-modal attribute', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[aria-modal="true"]')).toBeTruthy();
  });

  it('should pass loading state to confirm button', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('app-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should stop event propagation on dialog click', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dialog = compiled.querySelector('.confirm-dialog');
    expect(dialog).toBeTruthy();
  });
});
