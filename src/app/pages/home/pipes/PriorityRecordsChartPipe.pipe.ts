import { Pipe, PipeTransform } from '@angular/core';
import { ChartData } from 'chart.js';

@Pipe({
  name: 'priorityRecordsChart',
  pure: true, // Ensures it only runs when inputs change
  standalone: true,
})
export class PriorityRecordsChartPipe implements PipeTransform {
  transform(
    item: any,
    index: number,
    total: any,
    priorityRecordsColors: string[]
  ): ChartData<'doughnut'> {
    return {
      labels: [item.title],
      datasets: [
        {
          data: [item.count, total - item.count],
          backgroundColor: [
            priorityRecordsColors[index] || '#000000', // Fallback color
            '#ADBBBB',
          ],
        },
      ],
    };
  }
}
