import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'summary',
})
export class SummaryPipe implements PipeTransform {
  transform(text: string, limit?: number) {
    if (!text) return null;

    let desiredLimit = limit ? limit : 50;
    if (text.length <= desiredLimit) {
      return text;
    }

    return text.slice(0, desiredLimit) + '...';
  }
}
