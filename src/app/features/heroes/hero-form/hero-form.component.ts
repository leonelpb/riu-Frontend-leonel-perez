import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Hero } from '../models/hero.model';
import { UppercaseDirective } from '../../../shared/ui/uppercase/uppercase.directive';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [ReactiveFormsModule, UppercaseDirective],
  styleUrls: ['./hero-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hero-form" novalidate>
      <div class="hero-form__field">
        <label for="hero-name" class="hero-form__label">Name *</label>
        <input
          id="hero-name"
          type="text"
          class="hero-form__input"
          formControlName="name"
          placeholder="Enter hero name"
          [class.hero-form__input--error]="isFieldInvalid('name')"
          maxlength="100"
          appUppercase
        />
        @if (isFieldInvalid('name')) {
          <p class="hero-form__error" role="alert">
            @if (form.get('name')?.errors?.['required']) {
              Name is required.
            } @else if (form.get('name')?.errors?.['minlength']) {
              Name must be at least 2 characters.
            } @else if (form.get('name')?.errors?.['maxlength']) {
              Name cannot exceed 100 characters.
            }
          </p>
        }
      </div>

      <div class="hero-form__field">
        <label for="hero-image" class="hero-form__label">Image URL *</label>
        <input
          id="hero-image"
          type="url"
          class="hero-form__input"
          formControlName="image"
          placeholder="https://example.com/hero.jpg"
          [class.hero-form__input--error]="isFieldInvalid('image')"
        />
        @if (isFieldInvalid('image')) {
          <p class="hero-form__error" role="alert">
            @if (form.get('image')?.errors?.['required']) {
              Image URL is required.
            } @else if (form.get('image')?.errors?.['pattern']) {
              Please enter a valid URL.
            }
          </p>
        }
      </div>

      <div class="hero-form__field">
        <label for="hero-description" class="hero-form__label">Description *</label>
        <textarea
          id="hero-description"
          class="hero-form__input hero-form__textarea"
          formControlName="description"
          placeholder="Describe the hero..."
          rows="4"
          maxlength="500"
          [class.hero-form__input--error]="isFieldInvalid('description')"
        ></textarea>
        @if (isFieldInvalid('description')) {
          <p class="hero-form__error" role="alert">
            @if (form.get('description')?.errors?.['required']) {
              Description is required.
            } @else if (form.get('description')?.errors?.['minlength']) {
              Description must be at least 10 characters.
            } @else if (form.get('description')?.errors?.['maxlength']) {
              Description cannot exceed 500 characters.
            }
          </p>
        }
        <span class="hero-form__char-count"> {{ form.get('description')?.value?.length || 0 }} / 500 </span>
      </div>

      <div class="hero-form__field">
        <label for="hero-publisher" class="hero-form__label">Publisher</label>
        <input
          id="hero-publisher"
          type="text"
          class="hero-form__input"
          formControlName="publisher"
          placeholder="e.g. DC Comics, Marvel Comics"
        />
      </div>

      <div class="hero-form__field">
        <label for="hero-alignment" class="hero-form__label">Alignment</label>
        <select id="hero-alignment" class="hero-form__input hero-form__select" formControlName="alignment">
          <option value="">Select alignment</option>
          <option value="good">Good</option>
          <option value="bad">Bad</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      <div class="hero-form__actions">
        <button
          type="button"
          class="hero-form__btn hero-form__btn--ghost"
          (click)="cancel.emit()"
          aria-label="Cancel and go back"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="hero-form__btn hero-form__btn--primary"
          [disabled]="form.invalid || submitting"
          [attr.aria-busy]="submitting"
          aria-label="Submit hero form"
        >
          @if (submitting) {
            <span class="hero-form__spinner" aria-hidden="true"></span>
          }
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `,
})
export class HeroFormComponent implements OnInit, OnChanges {
  @Input() hero: Hero | null = null;
  @Input() submitting = false;
  @Input() submitLabel = 'Save';

  @Output() submitForm = new EventEmitter<Omit<Hero, 'id' | 'powerstats'>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  private readonly fb = inject(FormBuilder);

  private readonly imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

  ngOnInit(): void {
    this.initForm();
    if (this.hero) {
      this.populateForm(this.hero);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hero'] && this.form && this.hero) {
      this.populateForm(this.hero);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    this.submitForm.emit({
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      image: formValue.image.trim(),
      publisher: formValue.publisher?.trim() || '',
      alignment: formValue.alignment || 'neutral',
      firstAppearance: this.hero?.firstAppearance || '',
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      image: ['', [Validators.required, Validators.pattern(this.imageUrlPattern)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      publisher: [''],
      alignment: [''],
    });
  }

  private populateForm(hero: Hero): void {
    this.form.patchValue({
      name: hero.name,
      image: hero.image,
      description: hero.description,
      publisher: hero.publisher || '',
      alignment: hero.alignment || '',
    });
  }
}
