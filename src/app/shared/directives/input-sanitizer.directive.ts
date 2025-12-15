import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

@Directive({
  selector: '[appInputSanitizer]',
})
export class InputSanitizerDirective {
  constructor(private renderer: Renderer2) {}

  // Listen to input changes
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const processedValue = removeSpecialCharacters(inputElement.value);
    // Set the processed value back to the input field
    this.renderer.setProperty(inputElement, 'value', processedValue);
  }
}
