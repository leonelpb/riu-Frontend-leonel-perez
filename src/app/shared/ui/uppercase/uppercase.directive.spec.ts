import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { UppercaseDirective } from './uppercase.directive';

@Component({
  template: `<input type="text" [(ngModel)]="value" appUppercase />`,
  imports: [FormsModule, UppercaseDirective],
})
class TestHostComponent {
  value = '';
}

@Component({
  template: `<input type="text" [formControl]="control" appUppercase />`,
  imports: [ReactiveFormsModule, UppercaseDirective],
})
class ReactiveTestHostComponent {
  control = new FormControl('');
}

describe('UppercaseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('should uppercase on input', () => {
    input.value = 'spider-man';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('SPIDER-MAN');
  });

  it('should uppercase mixed case on input', () => {
    input.value = 'BatMan';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('BATMAN');
  });

  it('should preserve cursor position after uppercase', () => {
    input.focus();
    input.value = 'abc';
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new Event('input'));
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(2);
  });

  it('should handle empty value', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('');
  });

  it('should not change value if already uppercase', () => {
    input.value = 'BATMAN';
    input.dispatchEvent(new Event('input'));
    expect(input.value).toBe('BATMAN');
  });
});

describe('UppercaseDirective — Reactive Forms sync', () => {
  let fixture: ComponentFixture<ReactiveTestHostComponent>;
  let host: ReactiveTestHostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('should sync uppercase value back to FormControl model', () => {
    input.value = 'batman';
    input.dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('BATMAN');
  });

  it('should display and store uppercase consistently', () => {
    input.value = 'iron man';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('IRON MAN');
    expect(host.control.value).toBe('IRON MAN');
  });
});
