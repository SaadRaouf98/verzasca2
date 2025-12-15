import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartDataset, ChartType } from 'chart.js';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { DocumentsStatistics } from '@core/models/documents-statistics-summary';
import { CommitteeRecordsStatistics } from '@core/models/committee-records-statistics.model';
import { TranslateService } from '@ngx-translate/core';
import { data } from 'jquery';

@Component({
  selector: 'app-home-statistics-records',
  templateUrl: './home-statistics-records.component.html',
  styleUrls: ['./home-statistics-records.component.scss'],
})
export class HomeStatisticsRecordsComponent implements OnInit {
  // symbols drive both labels and data extraction
  readonly symbols = ['أ', 'ب', 'ج'];

  // ISO dates for start/end of this year
  private startOfYear = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .slice(0, 10);
  private endOfYear = new Date(new Date().getFullYear(), 11, 31)
    .toISOString()
    .slice(0, 10);

  // shared chart options
  readonly sharedChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { reverse: true, grid: { color: '#e0e0e0' } },
      y: {
        beginAtZero: true,
        position: 'right',
        // compute suggestedMax dynamically per-chart: return (maxValueAcrossDataOrStacks + 1)
        // This uses `context.chart` so it runs for the specific chart instance (each chart has its own max).
        suggestedMax: (context: any) => {
          try {
            const chart = context.chart as any;
            const datasets = (chart.data && chart.data.datasets) || [];
            const labels = (chart.data && chart.data.labels) || [];

            if (labels.length) {
              // For stacked charts we should sum values per label per stack group.
              // Build totals per stack id: { [stackId]: number[] }
              const stackTotals: Record<string, number[]> = {};
              const defaultStack = '__default__';
              datasets.forEach((ds: any) => {
                const stackId = ds.stack ?? defaultStack;
                if (!stackTotals[stackId]) stackTotals[stackId] = new Array(labels.length).fill(0);
                const data = ds.data || [];
                data.forEach((val: any, idx: number) => {
                  stackTotals[stackId][idx] += Number(val) || 0;
                });
              });

              // now compute the maximum total across all stacks and labels
              let globalMax = 0;
              for (const key of Object.keys(stackTotals)) {
                const arr = stackTotals[key];
                const localMax = arr.length ? Math.max(...arr) : 0;
                if (localMax > globalMax) globalMax = localMax;
              }
              return Math.ceil(globalMax) + 1;
            }

            // fallback: non-stacked, take the max value across all dataset points for this chart
            const flatValues: number[] = datasets.flatMap((ds: any) => (ds.data || []).map((v: any) => Number(v) || 0));
            const max = flatValues.length ? Math.max(...flatValues) : 0;
            return Math.ceil(max) + 1;
          } catch (e) {
            // on error, don't force a suggestedMax
            return undefined;
          }
        },
      },
    },

    plugins: {
      legend: { display: false },
     
      tooltip: {
        enabled: true,
        backgroundColor: '#B5A07D',
        titleColor: '#fff',
        bodyColor: '#fff',
        displayColors: false,
        
        bodyFont: {
          size: 12,
          weight: 'bold',
        },
        callbacks: {
          title: function () {
            return '';
          },
          label: function (context) {
            return `${context.dataset.label} : ${context.parsed.y}`;
          },
        },
        // barThickness is NOT valid here. Set barThickness in each dataset object instead.
      },
    },
  };

  // data & config
  committeeRecordsStatistics: CommitteeRecordsStatistics | null = null;
  stackedBarChartData: ChartDataset[] = [];
  groupedBarChartData: ChartDataset[] = [];
  stackedBarChartLabels = this.symbols;
  groupedBarChartLabels = this.symbols;
  stackedBarChartType: ChartType = 'bar';
  groupedBarChartType: ChartType = 'bar';
  stackedBarChartOptions = this.sharedChartOptions;
  groupedBarChartOptions = this.sharedChartOptions;

  documentsStatisticsSummary: DocumentsStatistics | null = null;

  constructor(
    private manageHomeService: ManageHomeService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadCommitteeStatistics();
    this.loadNotesAndLettersStatistics();
  }

  private loadCommitteeStatistics(): void {
    this.manageHomeService.statisticsService
      .getCommitteeRecordsStatistics(this.startOfYear, this.endOfYear)
      .subscribe((res) => {
        this.committeeRecordsStatistics = res;
        this.stackedBarChartData = this.buildDatasets(
          res.committees,
          'inActiveCount',
          'activeCount',
          ['#043049', '#ADDEFA'],
          [
            this.translate.instant('HomeModule.DashboardPage.inactiveRecords'),
            this.translate.instant('HomeModule.DashboardPage.activeRecords'),
          ],
          ['a', 'b'],
          
        );
        this.groupedBarChartData = this.buildDatasets(
          res.committees,
          'meetingRecordsCount',
          'handoverRecordsCount',
          ['#043049', '#ADDEFA'],
          [
            this.translate.instant('HomeModule.DashboardPage.meetingRecords'),
            this.translate.instant('HomeModule.DashboardPage.handoverRecords'),
          ],
          ['a', 'b'],
          
        );  
            console.log("this.groupedBarChartData;",this.groupedBarChartData);
            this.groupedBarChartData
    // or for a custom axis ID:
    // const customAxisMax = myChart.scales.myCustomYAxisID.max;

      });
  }

  /**
   * Generic helper: given the array of committee items and two numeric property names,
   * returns two ChartDataset entries for those props.
   */
  private buildDatasets(
    records: CommitteeRecordsStatistics['committees'],
    prop1: keyof CommitteeRecordsStatistics['committees'][0],
    prop2: keyof CommitteeRecordsStatistics['committees'][0],
    bgColors: [string, string],
    labels: [string, string],
    stacks: [string, string],
    
  ): ChartDataset[] {
    // for a given prop, flatten values in symbol order
    const dataFor = (prop: keyof (typeof records)[0]) =>
      this.symbols.flatMap((sym) =>
        records.filter((r) => r.symbol === sym).map((r) => Number(r[prop]))
      );

    return [
      {
        data: dataFor(prop1),
        label: labels[0],
        backgroundColor: bgColors[0],
        borderColor: bgColors[0],
        stack: stacks[0],
        barThickness: 28,
        
      },
      {
        data: dataFor(prop2),
        label: labels[1],
        backgroundColor: bgColors[1],
        borderColor: bgColors[1],
        stack: stacks[1],
        barThickness: 28,
      },
    ];
  }

  private loadNotesAndLettersStatistics(): void {
    this.manageHomeService.statisticsService
      .getNotesAndLettersStatistics(this.startOfYear, this.endOfYear)
      .subscribe((res) => {
        this.documentsStatisticsSummary = res;
      });
  }
  getActiveRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.activeCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getInActiveRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.inActiveCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getHandOverRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.handoverRecordsCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getMeetingsRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.meetingRecordsCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }
}
