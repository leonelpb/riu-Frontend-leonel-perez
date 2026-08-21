import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  styleUrls: ['./input.component.scss'],
  template: `
    <div [class]="wrapperClasses">
      @if (label) {
        <label [for]="inputId" class="input__label">{{ label }}</label>
      }
      <div class="input__wrapper">
        @if (prefix) {
          <span class="input__prefix" aria-hidden="true">{{ prefix }}</span>
        }
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.aria-invalid]="hasError"
          [attr.aria-describedby]="hasError ? errorId : null"
          class="input__field"
          [class.input__field--uppercase]="uppercase"
          [ngModel]="value"
          (ngModelChange)="onValueChange($event)"
          (blur)="onTouched()"
        />
        @if (suffix) {
          <span class="input__suffix" aria-hidden="true">{{ suffix }}</span>
        }
      </div>
      @if (hasError && errorMessage) {
        <p [id]="errorId" class="input__error" role="alert">{{ errorMessage }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() disabled = false;
  @Input() hasError = false;
  @Input() errorMessage = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() inputId = `input-${Math.random().toString(36).slice(2, 9)}`;
  @Input() uppercase = false;

  @Output() valueChange = new EventEmitter<string>();

  value = '';

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get wrapperClasses(): string {
    return [
      'input-container',
      this.hasError ? 'input-container--error' : '',
      this.disabled ? 'input-container--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(newValue: string): void {
    const final = this.uppercase ? newValue.toUpperCase() : newValue;
    this.value = final;
    this.onChange(final);
    this.valueChange.emit(final);
  }
}
