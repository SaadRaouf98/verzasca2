import { Pipe, PipeTransform } from '@angular/core';
import { PRIORITY_COLOR_MAP } from '@core/constants/priority-colors.constant';

@Pipe({
  name: 'priorityColor',
  standalone: true,
})
export class PriorityColorPipe implements PipeTransform {
  transform(colorCode: string): string {
    return PRIORITY_COLOR_MAP[colorCode] || '#333'; // fallback color
  }
}
