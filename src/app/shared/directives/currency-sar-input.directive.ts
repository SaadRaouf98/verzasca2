import {
  Directive,
  HostListener,
  ElementRef,
  Input,
  Inject,
  LOCALE_ID,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencySarInput]',
  standalone: true,
})
export class CurrencySarInputDirective implements OnInit {
  @Input() appCurrencySarInput: boolean = true;

  @Input() currencyCode: string = ''; // Default to SAR
  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Inject(LOCALE_ID) private locale: string,
    @Optional() @Self() private control: NgControl
  ) {}

  @HostListener('input', ['$event.target.value']) onInput(value: string) {
    // Remove all non-numeric and non-decimal characters
    const cleanedValue = value.replace(/[^0-9.]/g, '');

    // Don't set the raw input value here - let blur handler format it
    // Just ensure we don't have multiple decimals
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      // Multiple decimals - keep only the first one
      const sanitized = parts[0] + '.' + parts.slice(1).join('');
      this.el.nativeElement.value = sanitized;
    } else {
      this.el.nativeElement.value = cleanedValue;
    }
  }

  @HostListener('focus', ['$event.target.value']) onFocus(value: string) {
    // On focus, if value is default "0.00" (or similar), clear it for fresh input
    const numValue = parseFloat(this.el.nativeElement.value.replace(/[^0-9.]/g, ''));
    if (numValue === 0) {
      this.el.nativeElement.value = '';
      if (this.control && this.control.control) {
        this.control.control.setValue(null, { emitEvent: false });
      }
    }
    this.isTouched = false;
  }
  //  @HostListener('change', ['$event'])
  @HostListener('blur', ['$event']) onBlur(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    //  const numericValue = inputValue.replace(/[^0-9.]/g, '');
    // this.el.nativeElement.value = numericValue;

    this.formatInput(inputValue);
  }

  ngOnInit() {
    // Format the initial value on component load
    if (this.control && this.control.value !== undefined && this.control.value !== null) {
      this.formatInput(this.control.value);
    }
  }
  isTouched: boolean = false;
  private formatInput(value: string | number | null) {
    if (value === null || value === '') {
      this.el.nativeElement.value = '';
      if (this.control && this.control.control) {
        this.control.control.setValue(null, { emitEvent: false });
      }
      return;
    }

    // Convert to a number before formatting
    let numericValue: number;
    if (typeof value === 'string') {
      // Remove all non-numeric and non-decimal characters for parsing
      const cleanString = value.replace(/[^0-9.]/g, '');
      numericValue = parseFloat(cleanString);
    } else {
      numericValue = value;
    }

    if (!isNaN(numericValue)) {
      // Format with proper locale and always show 2 decimal places for display
      const formattedValue = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);

      // Update the form control's value with the NUMERIC value (not the formatted string)
      if (this.control && this.control.control) {
        this.control.control.setValue(numericValue, { emitEvent: false });
      }

      // Apply formatting only to the display (input element)
      this.el.nativeElement.value = formattedValue;
    }
  }
}
