import { Component, DestroyRef, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { FormControl, FormGroup } from '@angular/forms';
import { TransactionsStatusStatistics } from '@core/models/transactions-statistics-status.model';
import { RequestStatus } from '@core/enums/request-status.enum';
import { ViewChild } from '@angular/core';
import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  ChartEvent,
  ChartType,
  ChartTypeRegistry,
  Chart,
  Legend,
} from 'chart.js';
import { SystematicImports } from '@core/models/systematic-imports.model';
import { PriorityTransactions } from '@core/models/priority-transactions.model';
import { RecommendationResults } from '@core/models/recommendation-results.model';
import { FoundationsAmounts } from '@core/models/foundations-amounts.model';
import { DatesAmounts } from '@core/models/dates-amounts.model';
import { formatDateToYYYYMMDD, isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { PriorityRecords } from '@core/models/priority-records.model';
import { CommitteeRecordsStatistics } from '@core/models/committee-records-statistics.model';
import { CommitteeApprovals } from '@core/models/committee-approvals.model';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { CalendarFilterModalComponent } from '@pages/home/components/calendar-filter-modal/calendar-filter-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { MatDialog } from '@angular/material/dialog';
import { SignCategoryType, StatisticsCategory } from '@pages/home/enums/statistics-category.enum';
import { debounceTime, forkJoin, map } from 'rxjs';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexResponsive,
  ApexPlotOptions,
  ApexFill,
} from 'ng-apexcharts';
import { TestBed } from '@angular/core/testing';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';
import { fontStyle } from 'html2canvas/dist/types/css/property-descriptors/font-style';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
  responsive?: ApexResponsive[];
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
};

@Component({
  selector: 'app-statistics-detailed',
  templateUrl: './statistics-detailed.component.html',
  styleUrls: ['./statistics-detailed.component.scss'],
})
export class StatisticsDetailedComponent {
  form!: FormGroup;
  transactionsPieData: any = null;
  RequestStatus = RequestStatus;
  transactionsSummay: TransactionsStatusStatistics | null = null;
  // Chart options
  chartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: false,
        position: 'bottom',
      },
    },

    color: '#fff',
  };
  pieChartType: keyof ChartTypeRegistry = 'pie';

  /////////////////Systematic Imports//////////////////////////////////////////
  systematicImports: SystematicImports | null = null;
  systematicImportsColors: string[] = ['#DAD0BE', '#A38A5F'];
  systematicImportsDoughnutChartData: ChartData<'doughnut'> | null = null;
  // per-chart options for the systematic imports doughnut (includes center text plugin options)
  systematicImportsDoughnutOptions: ChartConfiguration['options'] | null = null;
  priorityTransactionsOptions: ChartConfiguration['options'] | null = null;

  /////////////////Priority Transactions//////////////////////////////////////////
  priorityTransactions: PriorityTransactions | null = null;
  priorityTransactionsColors: string[] = ['#D32F2F', '#FFA500', '#DB5757', '#A82424'];
  priorityTransactionsDoughnutChartData: ChartData<'doughnut'> | null = null;

  //////////////////Recommendation Results///////////////////////////////////////////////
  recommendationResults: RecommendationResults = null;
  recommendationResultsChartData: Partial<ChartOptions> = null;
  recommendationResultsColors: { id: string; color: string }[] = [
    {
      id: '',
      color: '#007A6D',
    },
    {
      id: '',
      color: '#3DB5B5',
    },
    {
      id: '',
      color: '#00FADD',
    },

    {
      id: '',
      color: '#27AE61',
    },
  ];
  //////////////////////////////////////////////////////////////////////////////////////
  // Doughnut
  public doughnutChartType: ChartType = 'doughnut';
  ////////////////////Foundations Amounts////////////////////////////////////////////////////
  foundationsAmounts: FoundationsAmounts | null = null;
  // creditsChartData: ChartConfiguration['data'] | null = null;
  public creditsChartData: Partial<ChartOptions> | any;
  totalCredits: number = 0;
  // costsChartData: ChartConfiguration['data'] | null = null;
  totalCosts: number = 0;
  show = false;
  lineChartType: ChartType = 'line';
  datesAmounts: DatesAmounts[] = [];
  //////////////////////Priority records/////////////////////////////////////////////
  priorityRecords: PriorityRecords | null = null;
  priorityRecordsColors: string[] = ['#D32F2F', '#FF7043', '#FBC02D'];
  // @ViewChild("chart") chart!: ChartComponent;
  public costsChartData: Partial<ChartOptions> | any;
  ////////////////// Stacked bar committee records ///////////////////////////////
  stackedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        reverse: true,
      },
      y: {
        position: 'right',
      },
    },
    plugins: {
      legend: {
        display: false,
        // position: 'bottom',
      },
    },
    color: '#20545F',
  };
  stackedBarChartLabels: string[] = ['أ', 'ب', 'ج'];
  stackedBarChartType: ChartType = 'bar';
  stackedBarChartLegend = true;
  stackedBarChartPlugins = [];

  stackedBarChartData: Partial<ChartOptions>;
  committeeRecordsStatistics: CommitteeRecordsStatistics | null = null;

  ////////////////// Grouped bar committee records ///////////////////////////////

  groupedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        reverse: true,
      },
      y: {
        position: 'right',
      },
    },
    plugins: {
      legend: {
        //  position: 'bottom',
        display: false,
      },
    },
    color: '#20545F',
  };
  // groupedBarChartLabels: string[] = ['أ', 'ب', 'ج'];
  // groupedBarChartType: ChartType = 'bar';
  // groupedBarChartLegend = true;
  // groupedBarChartPlugins = [];

  groupedBarChartData: Partial<ChartOptions> | any;

  ////////////////////////////Committee Approvals/////////////////////////////////////

  committeeApprovals: CommitteeApprovals[] = [];
  displayedColumns: string[] = ['committee', 'member', 'averageSign', 'actions', 'totalActions'];

  dataSource: any[] = [];
  data: any[] = [];
  signsCount: number = 0;
  converatismsCount: number = 0;
  opinionRefrainsCount: number = 0;
  ExportableDocumentActionType = ExportableDocumentActionType;

  //////////////////////////////////////////////////
  range: {
    fromDate: string;
    toDate: string;
  } = {
    fromDate: '',
    toDate: '',
  };

  // Date filter properties for app-date-picker components
  fromDate: string = '';
  toDate: string = '';

  StatisticsCategory = StatisticsCategory;
  filterCategory = StatisticsCategory.All;
  filterSign = SignCategoryType.PreparatoryCommittee;
  searchKeywordControl = new FormControl();
  searchKeyword: string = '';

  constructor(
    private manageHomeService: ManageHomeService,
    private location: Location,
    private dialog: MatDialog
  ) {
    // Register a small Chart.js plugin that draws center text when
    // `options.plugins.centerText.enabled` is truthy. The plugin reads
    // options from `options.plugins.centerText`:
    // { enabled: boolean, text: string, color?: string, font?: { size?: number, family?: string, weight?: string } }
    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        try {
          const opts = chart.config?.options?.plugins?.centerText;
          if (!opts || !opts.enabled) return;

          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;
          const text = opts.text || '';
          const fontSize = (opts.font && opts.font.size) || 16;
          const fontFamily = (opts.font && opts.font.family) || 'Arial';
          const fontWeight = (opts.font && opts.font.weight) || 'bold';
          ctx.save();
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = opts.color || '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, width / 2, height / 2);
          ctx.restore();
        } catch (e) {
          // swallow drawing errors to avoid breaking the chart
        }
      },
    };

    // Register plugin globally so chart instances can opt-in via options.plugins.centerText
    try {
      // Chart may already have the plugin registered; guard against duplicate registration
      if (!(Chart as any)._registeredCenterTextPlugin) {
        Chart.register(centerTextPlugin);
        (Chart as any)._registeredCenterTextPlugin = true;
      }
    } catch (e) {
      // ignore registration errors
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getStatistics('', '');
    this.detectUserSearching();
  }

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => {
          this.searchKeyword = value;
        })
      )
      .subscribe();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      filterCategory: new FormControl('1', []),
      searchKeyword: new FormControl('', []),
    });
  }

  isItMatching(text: string): boolean {
    return text.includes(this.searchKeyword);
  }

  onSearch(): void {}
  destroyRef = inject(DestroyRef);
  isLoading: boolean = false;
  getStatistics(fromDate: string, toDate: string): void {
    this.isLoading = true;
    forkJoin({
      transactionsSummay: this.manageHomeService.statisticsService.getTransactionsStatus(
        fromDate,
        toDate
      ),
      systematicImports: this.manageHomeService.statisticsService.getSystematicImports(
        fromDate,
        toDate
      ),
      priorityTransactions: this.manageHomeService.statisticsService.getPriorityTransactions(
        fromDate,
        toDate
      ),
      recommendationResults: this.manageHomeService.statisticsService.getRecommendationResults(
        fromDate,
        toDate
      ),
      foundationsAmounts: this.manageHomeService.statisticsService.getFoundationsAmounts(
        fromDate,
        toDate
      ),
      datesAmounts: this.manageHomeService.statisticsService.getDatesAmounts(fromDate, toDate),
      priorityRecords: this.manageHomeService.statisticsService.getPriorityRecords(
        fromDate,
        toDate
      ),
      committeeRecordsStatistics:
        this.manageHomeService.statisticsService.getCommitteeRecordsStatistics(fromDate, toDate),
      committeeApprovals: this.manageHomeService.statisticsService.getCommitteeApprovals(
        fromDate,
        toDate
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        /******************** transactionsSummay ************************/

        this.transactionsSummay = results.transactionsSummay;
        this.transactionsPieData = [
          {
            name: 'معاملات منجزة',
            val:
              this.transactionsSummay.values.find((ele) => ele.status === RequestStatus.Done)
                ?.count || 0,
            imgSrc: 'assets/icons/completed-transactions.svg',
          },
          {
            name: 'معاملات مجدولة',
            val:
              this.transactionsSummay.values.find((ele) => ele.status === RequestStatus.Scheduled)
                ?.count || 0,
            imgSrc: 'assets/icons/transactions-under-process.svg',
          },
          {
            name: 'معاملات تحت الإجراء',
            val:
              this.transactionsSummay.values.find((ele) => ele.status === RequestStatus.InProgress)
                ?.count || 0,
            imgSrc: 'assets/icons/scheduled-transactions.svg',
          },
        ];
        /******************** systematicImports ************************/

        this.systematicImports = results.systematicImports;
        console.log('this.systematicImports', this.systematicImports);
        this.systematicImportsDoughnutChartData = {
          labels: this.systematicImports.values.map((ele) => ele.title),
          datasets: [
            {
              data: this.systematicImports.values.map((ele) => ele.count),
              backgroundColor: [...this.systematicImportsColors],
            },
          ],
        };
        // enable center text on this doughnut chart (per-chart options)
        this.systematicImportsDoughnutOptions = {
          responsive: true,
          plugins: {
            // keep existing legend options from chartOptions if present
            ...(this.chartOptions.plugins || {}),
            centerText: {
              enabled: true,
              text: this.systematicImports.total,
              color: '#000',
              font: { size: 35, family: 'IBM Plex Sans Arabic', weight: 'bold' },
            },
          },
        } as ChartConfiguration['options'];

        /******************** priorityTransactions ************************/

        this.priorityTransactions = results.priorityTransactions;
        this.priorityTransactionsDoughnutChartData = {
          labels: this.priorityTransactions.values.map((ele) => ele.title),
          datasets: [
            {
              data: this.priorityTransactions.values.map((ele) => ele.count),
              backgroundColor: [...this.priorityTransactionsColors],
            },
          ],
        };
        // enable center text on this doughnut chart (per-chart options)
        this.priorityTransactionsOptions = {
          responsive: true,
          plugins: {
            // keep existing legend options from chartOptions if present
            ...(this.chartOptions.plugins || {}),
            centerText: {
              enabled: true,
              text: this.priorityTransactions.total,
              color: '#000',
              font: { size: 35, family: 'IBM Plex Sans Arabic', weight: 'bold' },
            },
          },
        } as ChartConfiguration['options'];

        console.log(this.priorityTransactions.total, 'cmfjdbvjhchjbcbdcbj');

        /******************** recommendationResults ************************/

        this.recommendationResults = results.recommendationResults;
        console.log('this.recommendationResults', this.recommendationResults);
        // Build series data: for each outcome (legend entry) create a series whose
        // data is the count of that outcome in each time bucket (res.values).
        // Use map (not forEach) to produce arrays.
        // defensive series builder: coerce ids to string when comparing and
        // guard against missing arrays. This avoids `undefined` values when
        // ids come as numbers/strings or some buckets are missing outcomes.
        console.log('recommendation results raw', this.recommendationResults);
        const sriArr = (this.recommendationResults.outcomesSummary || []).map((outcome) => {
          const seriesData = (this.recommendationResults.values || []).map((bucket: any) => {
            const found = (bucket?.outcomes || []).find(
              (o: any) => String(o?.id) === String(outcome?.id)
            );
            return found && found.count != null ? Number(found.count) : 0;
          });
          return { name: outcome?.title || '', data: seriesData };
        });
        console.log('sriArr', sriArr);
        this.recommendationResultsChartData = {
          series: sriArr,

          chart: {
            type: 'bar',
            height: 435,

            stacked: true,
            toolbar: {
              show: true,
            },
            zoom: {
              enabled: true,
            },
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: 'bottom',
                  offsetX: -10,
                  offsetY: 0,
                },
              },
            },
          ],
          plotOptions: {
            bar: {
              horizontal: false,
            },
          },
          xaxis: {
            type: 'category',
            categories: (this.recommendationResults.values || []).map((v: any) => v.title),
          },
          legend: {
            position: 'top',
            offsetY: 0,
            horizontalAlign: 'left',
          },
          fill: {
            opacity: 1,
            colors: ['#A38A5F', '#B5A07D', '#DAD0BE', '#A38A5F'],
          },
        };
        /******************** foundationsAmounts ************************/

        this.foundationsAmounts = results.foundationsAmounts;
        /******************** datesAmounts ************************/

        this.datesAmounts = results.datesAmounts;
        console.log('this.datesAmounts', this.datesAmounts);
        this.totalCredits = 0;
        this.totalCosts = 0;
        this.datesAmounts.forEach((ele) => {
          this.totalCredits += ele.creditsApprovedAmount;
        });
        this.datesAmounts.forEach((ele) => {
          this.totalCosts += ele.costsApprovedAmount;
        });

        this.creditsChartData = {
          series: [
            {
              name: 'المبالغ المعتمدة',
              data: this.datesAmounts.map((ele) => ele.creditsApprovedAmount),
            },
            {
              name: 'المبالغ المطلوبة',
              data: this.datesAmounts.map((ele) => ele.creditsRequestedAmount),
            },
          ],
          chart: {
            type: 'area',
            height: 350,
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: 'bottom',
                  offsetX: -10,
                  offsetY: 0,
                },
              },
            },
          ],
          plotOptions: {
            bar: {
              horizontal: false,
            },
          },
          labels: this.datesAmounts.map((ele) => ele.title?.replaceAll('/', '-')),
          xaxis: {
            type: '',
          },
          yaxis: {
            opposite: false,
            labels: {
              formatter: (value: number) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
          legend: {
            position: 'top',

            horizontalAlign: 'left',
          },
          fill: {
            opacity: 1,
            colors: ['#4CAF50', '#B5A07D'],
          },
        };

        this.costsChartData = {
          series: [
            {
              name: 'اجمالي التكاليف',
              data: this.datesAmounts.map((ele) => ele.costsApprovedAmount),
            },
            {
              name: 'المبالغ المطلوبة',
              data: this.datesAmounts.map((ele) => ele.costsRequestedAmount),
            },
          ],
          chart: {
            type: 'area',
            height: 350,
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
          },

          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: 'bottom',
                  offsetX: -10,
                  offsetY: 0,
                },
              },
            },
          ],
          labels: this.datesAmounts.map((ele) => ele.title),
          xaxis: {
            type: '',
          },
          yaxis: {
            opposite: false,
            labels: {
              formatter: (value: number) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
          legend: {
            position: 'top',

            horizontalAlign: 'left',
          },
          fill: {
            opacity: 1,
            colors: ['#DBF0DC', '#B5A07D'],
          },
        };
        /******************** priorityRecords ************************/

        this.priorityRecords = results.priorityRecords;

        /******************** committeeRecordsStatistics ************************/

        this.committeeRecordsStatistics = results.committeeRecordsStatistics;

        this.stackedBarChartData = {
          series: [
            {
              name: 'النشطة',
              data: this.committeeRecordsStatistics.committees.map((ele) => ele.activeCount),
            },
            {
              name: 'الغير نشطة',
              data: this.committeeRecordsStatistics.committees.map((ele) => ele.inActiveCount),
            },
          ],
          chart: {
            type: 'bar',
            height: 350,
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
          },

          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: 'bottom',
                  offsetX: -10,
                  offsetY: 0,
                },
              },
            },
          ],
          // labels: res.committees.map((ele) => ele.symbol),
          xaxis: {
            categories: this.committeeRecordsStatistics.committees.map((ele) => ele.symbol),
            labels: {
              style: {
                fontSize: '14px',
                fontWeight: 700,
              },
            },
          },
          yaxis: {
            opposite: false,
            labels: {
              formatter: (value: number) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
          legend: {
            position: 'top',
            offsetY: -35,
            horizontalAlign: 'left',
          },
          fill: {
            opacity: 1,
            colors: ['#5BBDF6', '#08659B'],
          },
        };

        this.groupedBarChartData = {
          series: [
            {
              name: 'التمرير',
              data: this.committeeRecordsStatistics.committees.map((ele) => ele.activeCount),
            },
            {
              name: 'الاجتماع',
              data: this.committeeRecordsStatistics.committees.map((ele) => ele.inActiveCount),
            },
          ],
          chart: {
            type: 'bar',
            height: 350,
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
          },

          responsive: [
            {
              breakpoint: 480,
              options: {
                legend: {
                  position: 'bottom',
                  offsetX: -10,
                  offsetY: 0,
                },
              },
            },
          ],
          // labels: res.committees.map((ele) => ele.symbol),
          xaxis: {
            categories: this.committeeRecordsStatistics.committees.map((ele) => ele.symbol),
            labels: {
              style: {
                fontSize: '14px',
                fontWeight: 700,
              },
            },
          },
          yaxis: {
            opposite: false,
            labels: {
              formatter: (value: number) => {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
          legend: {
            position: 'top',
            offsetY: -35,
            horizontalAlign: 'left',
          },
          fill: {
            opacity: 1,
            colors: ['#5BBDF6', '#08659B'],
          },
        };

        /******************** committeeApprovals ************************/

        this.committeeApprovals = results.committeeApprovals;
        this.isLoading = false;
        this.filterCommitteeApprovals();
      });
  }

  filterCommitteeApprovals() {
    this.opinionRefrainsCount = 0;
    this.converatismsCount = 0;
    this.signsCount = 0;
    const tempArr: any[] = [];
    const index = this.findIndexByTitle(this.filterSign);
    this.data = this.committeeApprovals[index].members;
    this.committeeApprovals[index].members.forEach((innerEle, innerIndex) => {
      const opinionRefrainCount =
        innerEle.actions.find((ele) => ele.type === ExportableDocumentActionType.OpinionRefrain)
          ?.count || 0;

      this.opinionRefrainsCount += opinionRefrainCount;

      const conservatismCount =
        innerEle.actions.find((ele) => ele.type === ExportableDocumentActionType.Conservatism)
          ?.count || 0;

      this.converatismsCount += conservatismCount;

      const signCount =
        innerEle.actions.find((ele) => ele.type === ExportableDocumentActionType.Sign)?.count || 0;

      this.signsCount += signCount;

      tempArr.push({
        committee: this.committeeApprovals[index].title,
        member: innerEle.name,
        averageSign: innerEle.averageActionsMinutes,
        totalActions: innerEle.totalActions,
        opinionRefrain: opinionRefrainCount,
        conservatism: conservatismCount,
        sign: signCount,
      });
    });
    this.dataSource = tempArr;
  }

  findIndexByTitle(title: string) {
    return this.committeeApprovals.findIndex((committee) => committee.title === title);
  }

  isAltRow(row: any): boolean {
    return this.dataSource.indexOf(row) % 2 !== 0;
  }

  getRecommendationResultProgress(
    recommendation: {
      id: string;
      title: string;
      count: number;
    }[],
    recommendationResultCount: number
  ): {
    percentage: number;
    foregroundColor: string;
    count: number;
  }[] {
    let arr = recommendation.map((ele, index) => {
      return {
        percentage: (ele.count / recommendationResultCount) * 100,
        foregroundColor: this.getRecommendationResultColor(ele.id),
        count: ele.count,
      };
    });

    //Add last div
    arr.push({
      percentage: 10,
      foregroundColor: '#ADBBBB',
      count: 0,
    });
    return arr;
  }

  getRecommendationResultColor(outComeId: string): string {
    for (const item of this.recommendationResultsColors) {
      if (item.id === outComeId) {
        return item.color;
      }
    }
    return '#000';
  }

  // getRecommendationSummaryPercentage(item: {
  //   id: string;
  //   title: string;
  //   count: number;
  // }): string {
  //   const total = this.recommendationResults?.total || 0;
  //   return ((item.count / total) * 100).toFixed(0) + '%';
  // }

  getPriorityRecordsSummaryPercentage(item: { id: string; title: string; count: number }): string {
    const total = this.priorityRecords?.total || 0;

    return `${((item.count / total) * 100).toFixed(0)}%`;
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

  /**
   * Handles changes to the fromDate filter
   * Triggers getStatistics() if both dates are set
   */
  onFromDateChange(): void {
    if (this.fromDate && this.toDate) {
      const formattedFromDate = this.formatDate(this.fromDate);
      const formattedToDate = this.formatDate(this.toDate);
      this.getStatistics(formattedFromDate, formattedToDate);
    }
  }

  /**
   * Handles changes to the toDate filter
   * Triggers getStatistics() if both dates are set
   */
  onToDateChange(): void {
    if (this.fromDate && this.toDate) {
      const formattedFromDate = this.formatDate(this.fromDate);
      const formattedToDate = this.formatDate(this.toDate);
      this.getStatistics(formattedFromDate, formattedToDate);
    }
  }

  /**
   * Formats a date value to YYYY-MM-DD format (same as calendar-filter-modal)
   * Uses moment with English locale to handle Arabic numerals properly
   */
  private formatDate(date: any): string {
    if (!date) return '';

    try {
      // Convert to moment with English locale (same as calendar-filter-modal)
      const momentDate = require('moment')(String(date)).locale('en');

      if (momentDate.isValid()) {
        return momentDate.format('YYYY-MM-DD');
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
    }

    return '';
  }

  /**
   * Resets the date filters and reloads statistics with empty date range
   */
  onResetDateFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.getStatistics('', '');
  }

  /**
   * Checks if date filters are active
   */
  isDateFiltered(): boolean {
    return !!(this.fromDate && this.toDate);
  }

  onOpenCalendarFilter(): void {
    const dialogRef = this.dialog.open(CalendarFilterModalComponent, {
      width: isSmallDeviceWidthForPopup() ? '500px' : '750px',
      maxWidth: '95vw',

      autoFocus: false,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        this.range = {
          fromDate: dialogResult.data.fromDate,
          toDate: dialogResult.data.toDate,
        };
        this.getStatistics(dialogResult.data.fromDate, dialogResult.data.toDate);
      }
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }

  protected readonly SignCategoryType = SignCategoryType;
}
