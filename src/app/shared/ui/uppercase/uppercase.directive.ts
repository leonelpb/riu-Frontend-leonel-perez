import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class UppercaseDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);
  private readonly control = inject(NgControl, { optional: true });

  onInput(): void {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);
    this.control?.control?.setValue(input.value, { emitEvent: false });
  }
}
