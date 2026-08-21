import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply neutral variant by default', () => {
    expect(component.classes).toBe('badge badge--neutral');
  });

  it('should apply correct variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    expect(component.classes).toBe('badge badge--success');
  });

  it('should apply danger variant', () => {
    fixture.componentRef.setInput('variant', 'danger');
    expect(component.classes).toBe('badge badge--danger');
  });

  it('should apply primary variant', () => {
    fixture.componentRef.setInput('variant', 'primary');
    expect(component.classes).toBe('badge badge--primary');
  });

  it('should apply warning variant', () => {
    fixture.componentRef.setInput('variant', 'warning');
    expect(component.classes).toBe('badge badge--warning');
  });

  it('should render label', () => {
    fixture.componentRef.setInput('label', 'Active');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active');
  });

  it('should have default empty label', () => {
    expect(component.label).toBe('');
  });
});
