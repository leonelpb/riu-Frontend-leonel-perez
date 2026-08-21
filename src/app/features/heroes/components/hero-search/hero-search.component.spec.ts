import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroSearchComponent } from './hero-search.component';

describe('HeroSearchComponent', () => {
  let component: HeroSearchComponent;
  let fixture: ComponentFixture<HeroSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty searchTerm initially', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should emit search event when onSearch is called', () => {
    spyOn(component.search, 'emit');
    component.onSearch('batman');
    expect(component.search.emit).toHaveBeenCalledWith('batman');
  });

  it('should update searchTerm when onSearch is called', () => {
    component.onSearch('batman');
    expect(component.searchTerm).toBe('batman');
  });

  it('should render search input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-search')).toBeTruthy();
  });

  it('should render app-input component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-input')).toBeTruthy();
  });
});
