import { Component, OnInit } from '@angular/core';
import {
  ChartConfiguration,
  ChartTypeRegistry,
  ChartDataset,
  ChartType,
} from 'chart.js';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { TransactionsStatusStatistics } from '@core/models/transactions-statistics-status.model';
import { RequestStatus } from '@core/enums/request-status.enum';
import { DocumentsStatistics } from '@core/models/documents-statistics-summary';

@Component({
  selector: 'app-home-statistics-section',
  templateUrl: './home-statistics-section.component.html',
  styleUrls: ['./home-statistics-section.component.scss'],
})
export class HomeStatisticsSectionComponent implements OnInit {
  public transactionsSummary!: TransactionsStatusStatistics;
  public transactionsPieData!: ChartConfiguration<'pie'>['data'];

  public pieChartType: any = 'pie';
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    plugins: {
      legend: {
        display: false,
        position: 'bottom',
      },
    },
    color: '#fff',
  };

  private startOfYear = this.formatDate(
    new Date(new Date().getFullYear(), 0, 1)
  );
  private endOfYear = this.formatDate(
    new Date(new Date().getFullYear(), 11, 31)
  );
  documentsStatisticsSummary: DocumentsStatistics | null = null;
  constructor(private manageHomeService: ManageHomeService) {}

  ngOnInit() {
    this.loadTransactionStatistics();
    this.loadNotesAndLettersStatistics();
  }

  private loadTransactionStatistics(): void {
    this.manageHomeService.statisticsService
      .getTransactionsStatus(this.startOfYear, this.endOfYear)
      .subscribe((res: TransactionsStatusStatistics) => {
        this.transactionsSummary = res;
        this.transactionsPieData = this.buildTransactionsPieData(res);
      });
  }

  private buildTransactionsPieData(
    res: TransactionsStatusStatistics
  ): ChartConfiguration<'pie'>['data'] {
    const countFor = (status: RequestStatus) =>
      res.values.find((v) => v.status === status)?.count ?? 0;

    return {
      labels: ['معاملات منجزة', 'معاملات مجدولة', 'معاملات تحت الإجراء'],
      datasets: [
        {
          label: '',
          data: [
            countFor(RequestStatus.Done),
            countFor(RequestStatus.InProgress),
            countFor(RequestStatus.Scheduled),
          ],
          backgroundColor: ['#ADDEFA', '#08659B', '#021C2C'],
          borderColor: ['#ADDEFA', '#08659B', '#021C2C'],
          borderWidth: 1,
        },
      ],
    };
  }

  /** Helper to format a Date as 'YYYY-MM-DD' */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  private loadNotesAndLettersStatistics(): void {
    this.manageHomeService.statisticsService
      .getNotesAndLettersStatistics(this.startOfYear, this.endOfYear)
      .subscribe((res: DocumentsStatistics) => {
        this.documentsStatisticsSummary = res;
      });
  }
}
