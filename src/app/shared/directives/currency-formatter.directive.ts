import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyFormatter]',
})
export class CurrencyFormatterDirective {
  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private control: NgControl,
    private currencyPipe: CurrencyPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: string) {
    this.el.value =
      this.currencyPipe.transform(
        value.replace(/[^0-9.]/g, ''),
        'SAR ',
        'symbol',
        '1.2-2'
      ) || '';

    this.control.control?.setValue(this.el.value);
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    this.el.value =
      this.currencyPipe.transform(
        value.replace(/[^0-9.]/g, ''),
        'SAR ',
        'symbol',
        '1.2-2'
      ) || '';
    this.control.control?.setValue(this.el.value);
  }
}
