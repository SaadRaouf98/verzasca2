import {
  Component,
  Input,
  ChangeDetectionStrategy,
  forwardRef,
  Optional,
  Self,
  Host,
  ElementRef,
  Renderer2,
  OnDestroy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { CurrencySarInputDirective } from '../../directives/currency-sar-input.directive';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  imports: [TranslateModule, NgIf, NgFor, CurrencySarInputDirective],
  standalone: true,
})
export class InputComponent implements ControlValueAccessor {
  @Input() appCurrencySarInput: boolean = false;
  @Input() showriyalIcon: boolean = false;
  /** Whether the input is readonly */
  @Input() readonly = false;

  /** Label text shown above the input */
  @Input() label?: string;
  /** HTML5 type attribute (text, email, number, etc.) */
  @Input() type = 'text';
  /** Placeholder inside the input */
  @Input() placeholder = '';
  /** Whether the input is disabled */
  @Input() disabled = false;
  /** Custom error messages override defaults */
  @Input() errors: Record<string, string> = {};
  @Input() showSearchIcon = false;
  @Input() showFilterIcon = false;
  @Output() filterIconClick = new EventEmitter<MouseEvent>();
  @Input() clicked: boolean = false;
  @Output() searchName: EventEmitter<string> = new EventEmitter<string>();

  /** Internal value */
  private _value: any = '';

  constructor(private cdr: ChangeDetectorRef) {}

  get value(): any {
    return this._value;
  }
  set value(val: any) {
    this._value = val;
    this.onChange(val);
    this.cdr.markForCheck();
  }

  // Backing field to hold the injected NgControl instance (if any)
  private _ngControl: NgControl | null = null;

  @Optional() // If no NgControl provider exists on this element, inject null instead of erroring
  @Self() // Only look for NgControl on this element itself (don’t walk up the injector tree)
  @Host() // Stop at the host element boundary (prevents grabbing controls from ancestor components)
  set ngControl(control: NgControl | null) {
    // Store the injected NgControl (could be FormControlName, NgModel, etc.)
    this._ngControl = control;

    if (this._ngControl) {
      // Tell Angular’s forms API that *this* component
      // will act as the ControlValueAccessor
      this._ngControl.valueAccessor = this;
    }
  }

  // Expose the underlying FormControl (or FormControlDirective) instance,
  // so you can read .valueChanges, .valid, .touched, etc.
  get control() {
    return this._ngControl?.control;
  }

  // Compute validation error messages
  get errorMessages(): string[] {
    const ctrl = this.control;
    if (!ctrl) {
      return [];
    }
    const errs = ctrl.errors ?? {};
    const defaultErrors: Record<string, string> = {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      minlength: errs['minlength']
        ? `Minimum length is ${(errs['minlength'] as any).requiredLength}.`
        : '',
      maxlength: errs['maxlength']
        ? `Maximum length is ${(errs['maxlength'] as any).requiredLength}.`
        : '',
      pattern: 'Invalid format.',
    };
    return Object.keys(errs).map(
      (key) =>
        this.errors[key] ||
        defaultErrors[key] ||
        (errs[key] as any).message ||
        key
    );
  }

  // ControlValueAccessor methods
  writeValue(obj: any): void {
    this._value = obj;
    this.cdr.markForCheck();
  }

  private onChange = (_: any) => {};
  private onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // onInput(event: Event): void {
  //   this.value = (event.target as HTMLInputElement).value;
  // }
  // changeValue(value: any) {
  //   this.searchName.emit(value.target.value);
  // }
  changeValue(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this._value = inputValue;
    this.onChange(inputValue);
    this.searchName.emit(inputValue);
  }

  onInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this._value = inputValue;
    this.onChange(inputValue);
  }
  onBlur(): void {
    this.onTouched();
  }
}
