import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class UppercaseDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  onInput(): void {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);
  }
}
