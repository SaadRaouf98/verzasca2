import { Pipe, PipeTransform } from '@angular/core';
import { ChartData } from 'chart.js';
import {ExportableDocumentActionType} from '@core/enums/exportable-document-action-type.enum';

@Pipe({
  name: 'committeeApprovalChart',
  pure: true, // Ensures it only runs when inputs change
  standalone: true,
})
export class CommitteeApprovalChartPipe implements PipeTransform {
  transform(
    item: { title: string; count: number; actionType: ExportableDocumentActionType },
    signsCount: number,
    conservatismsCount: number,
    opinionRefrainsCount: number
  ): ChartData<'doughnut'> {
    const total = signsCount + conservatismsCount + opinionRefrainsCount;

    const colors = new Map<ExportableDocumentActionType, string>([
      [ExportableDocumentActionType.Sign, '#27AE61'],
      [ExportableDocumentActionType.Conservatism, '#F76B15'],
      [ExportableDocumentActionType.OpinionRefrain,'#BA161E' ],
    ]);
    return {
      labels: [item.title],
      datasets: [
        {
          data: [item.count, total - item.count],
          backgroundColor: [colors.get(item.actionType) || '#FFF', '#ADBBBB'],
        },
      ],
    };
  }
}

