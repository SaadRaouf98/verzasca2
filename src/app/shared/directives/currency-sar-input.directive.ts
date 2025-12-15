import {
  Directive,
  HostListener,
  ElementRef,
  Input,
  Inject,
  LOCALE_ID,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencySarInput]',
  standalone: true,
})
export class CurrencySarInputDirective implements OnInit {
  @Input() useDirective: boolean = true;

  @Input() currencyCode: string = ''; // Default to SAR
  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Inject(LOCALE_ID) private locale: string,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event.target.value']) onInput(value: string) {
    // Optional: restrict input to only numbers and special characters as the user types

    const cleanedValue = value.replace(/[^0-9,.]/g, '');
    this.el.nativeElement.value = cleanedValue;
    //  this.formatInput(cleanedValue);
  }

  @HostListener('focus', ['$event.target.value']) onFocus(value: string) {
    // On focus, remove formatting for easier editing
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
    this.formatInput(this.control.value);
  }
  isTouched: boolean = false;
  private formatInput(value: string | number | null) {
    if (value === null || value === '') {
      this.el.nativeElement.value = '';
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
      // Format with proper locale and always show 2 decimal places
      const formattedValue = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);

      // Update the form control's value with the formatted string
      this.control.control?.setValue(formattedValue, { emitEvent: false });

      // Apply formatting directly
      this.el.nativeElement.value = formattedValue;
    }
  }
}
