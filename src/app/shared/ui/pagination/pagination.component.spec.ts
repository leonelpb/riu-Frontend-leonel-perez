import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  function setInputs(totalItems: number, pageSize: number, currentPage: number): void {
    fixture.componentRef.setInput('totalItems', totalItems);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when only 1 page', () => {
    setInputs(5, 10, 1);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pagination')).toBeFalsy();
  });

  it('should render pagination when multiple pages', () => {
    setInputs(25, 10, 1);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pagination')).toBeTruthy();
  });

  it('should emit pageChange on page click', () => {
    spyOn(component.pageChange, 'emit');
    setInputs(25, 10, 1);

    component.goToPage(2);

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit for page 0', () => {
    spyOn(component.pageChange, 'emit');
    setInputs(25, 10, 1);

    component.goToPage(0);

    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should not emit for page beyond total', () => {
    spyOn(component.pageChange, 'emit');
    setInputs(25, 10, 1);

    component.goToPage(100);

    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should calculate total pages correctly', () => {
    setInputs(25, 10, 1);

    expect(component.totalPages()).toBe(3);
  });

  it('should calculate total pages as 1 for empty items', () => {
    setInputs(0, 10, 1);

    expect(component.totalPages()).toBe(1);
  });

  it('should calculate total pages correctly for exact division', () => {
    setInputs(30, 10, 1);

    expect(component.totalPages()).toBe(3);
  });

  it('should show page info text', () => {
    setInputs(25, 10, 2);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Page 2 of 3');
  });

  it('should calculate visible pages', () => {
    setInputs(100, 10, 5);

    const pages = component.visiblePages();
    expect(pages).toContain(5);
    expect(pages.length).toBeLessThanOrEqual(5);
  });

  it('should handle visible pages near the start', () => {
    setInputs(100, 10, 1);

    const pages = component.visiblePages();
    expect(pages).toContain(1);
    expect(pages[0]).toBe(1);
  });

  it('should handle visible pages near the end', () => {
    setInputs(100, 10, 10);

    const pages = component.visiblePages();
    expect(pages).toContain(10);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it('should disable previous button on first page', () => {
    setInputs(25, 10, 1);

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.pagination__btn');
    expect((buttons[0] as HTMLButtonElement)?.disabled).toBeTrue();
    expect((buttons[1] as HTMLButtonElement)?.disabled).toBeTrue();
  });

  it('should disable next button on last page', () => {
    setInputs(25, 10, 3);

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.pagination__btn');
    expect((buttons[buttons.length - 2] as HTMLButtonElement)?.disabled).toBeTrue();
    expect((buttons[buttons.length - 1] as HTMLButtonElement)?.disabled).toBeTrue();
  });
});
