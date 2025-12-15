import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transactionNumberFormatter',
  standalone: true,
})
export class TransactionNumberPipe implements PipeTransform {
  transform(num: number) {
    const text = num + '';
    if (!text) return null;

    if (text.length >= 4) {
      return text;
    }

    return text.padStart(4, '0');
  }
}
