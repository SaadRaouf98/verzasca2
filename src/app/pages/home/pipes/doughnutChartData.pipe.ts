import {Pipe, PipeTransform} from '@angular/core';
import {ChartData} from 'chart.js';

@Pipe({
  name: 'doughnutChartData',
  pure: true, // Ensures the pipe runs only when inputs change
  standalone: true
})
export class DoughnutChartDataPipe implements PipeTransform {
  transform(
    item: any,
    recommendationResultsColors: { id: string; color: string }[],
    total: any
  ): ChartData<'doughnut'> {
    let itemColor = '';

    for (const ele of recommendationResultsColors) {
      if (ele.id === item.id) {
        itemColor = ele.color;
        break; // Optimize loop by breaking early
      }
    }

    return {
      labels: [item.title],
      datasets: [
        {
          data: [item.count, total - item.count],
          backgroundColor: [itemColor || '#000000', '#ADBBBB'],
        },
      ],
    };
  }
}
