import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

import { User } from '@pages/my-profile/interfaces/profile';
import { tap } from 'rxjs';
import { ManageTimeAttendanceService } from '@pages/time-attendance/services/manage-time-attendance.service';
import { TimeAttendanceSummary } from '@core/models/time-attendant.model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ChartComponent,
} from 'ng-apexcharts';
import { DayOfWeek, DayOfWeekArabic } from '@core/enums/day-of-week.enum';

type ApexXAxis = {
  type?: 'category' | 'datetime' | 'numeric';
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexXAxis | any;
  xaxis: ApexXAxis | any;
  grid: ApexGrid | any;
  colors: any;
  legend: ApexLegend | any;
  shadow: any;
  fill: any;
};

@Component({
  selector: 'app-attendance-and-departure-card',
  templateUrl: './attendance-and-departure-card.component.html',
  styleUrls: ['./attendance-and-departure-card.component.scss'],
})
export class AttendanceAndDepartureCardComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = true;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  userInfo!: User;
  pageIndex: number = 0;
  pageSize: number = 20;
  showChart = false;
  selectedPeriod: string = 'weekly';
  periodOptions: any[] = [];
  range: {
    fromDate: string;
    toDate: string;
  } = {
    fromDate: '',
    toDate: '',
  };
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  summary!: TimeAttendanceSummary;
  day = new Date();
  active = 'top';
  filtersData!: {
    startDate: any;
    endDate: any;
  };

  constructor(
    private manageTimeAttendanceService: ManageTimeAttendanceService,
    private langugaeService: LanguageService,
    private translate: TranslateService
  ) {
    this.initializePeriodOptions();
  }

  initializePeriodOptions(): void {
    this.periodOptions = [
      { label: this.translate.instant('shared.weekly'), value: 'weekly' },
      { label: this.translate.instant('shared.monthly'), value: 'monthly' },
    ];
  }

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializePeriodOptions();
    this.getWeekRangeDates();
  }

  crateChart(data: any[], categories: any[]) {
    this.chartOptions = {
      series: [
        {
          name: 'عدد ساعات العمل',
          data: data.reverse(),
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        },
        rtl: false,
      },
      colors: ['#A38A5F'],
      plotOptions: {
        bar: {
          columnWidth: '35%',
          distributed: false,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#20545F'],
        },
      },
      legend: {
        show: false,
      },
      grid: {
        show: true,
        borderColor: '#f0f0f0',
        strokeDashArray: 0,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: categories.reverse(),
        reverse: true,
        labels: {
          style: {
            colors: '#20545F',
            fontSize: '10px',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        opposite: true,
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: '#20545F',
            fontSize: '12px',
          },
        },
        max: (() => {
          const maxValue = Math.max(...data.map((val) => parseFloat(val) || 0));
          return Math.ceil(maxValue) + 1;
        })(),
      },
    };
  }

  initializeTable() {
    return this.manageTimeAttendanceService.timeAttendancesService
      .getTimeAttendanceList(
        {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
        },
        this.filtersData
      )
      .pipe(
        tap((res) => {
          // Create a map of work time by day of week
          const workTimeByDayOfWeek: { [key: number]: string } = {};

          res.records.forEach((entry) => {
            workTimeByDayOfWeek[entry.dayOfWeek] = entry.totalWorkTime;
          });

          // Create arrays for all 7 days starting from Sunday (0) to Saturday (6)
          const dayLabels = [
            DayOfWeekArabic[0], // Sunday
            DayOfWeekArabic[1], // Monday
            DayOfWeekArabic[2], // Tuesday
            DayOfWeekArabic[3], // Wednesday
            DayOfWeekArabic[4], // Thursday
            DayOfWeekArabic[5], // Friday
            DayOfWeekArabic[6], // Saturday
          ];

          const dayValues = [
            workTimeByDayOfWeek[0] || '0',
            workTimeByDayOfWeek[1] || '0',
            workTimeByDayOfWeek[2] || '0',
            workTimeByDayOfWeek[3] || '0',
            workTimeByDayOfWeek[4] || '0',
            workTimeByDayOfWeek[5] || '0',
            workTimeByDayOfWeek[6] || '0',
          ];

          this.crateChart(dayValues, dayLabels);
        })
      );
  }

  getWeekRangeDates() {
    const currentDay = new Date();
    const dayOfWeek = currentDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate the Sunday of the current week
    const daysFromSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
    const sundayDate = new Date(currentDay);
    sundayDate.setDate(currentDay.getDate() - daysFromSunday);

    // Calculate Saturday (6 days after Sunday)
    const saturdayDate = new Date(sundayDate);
    saturdayDate.setDate(sundayDate.getDate() + 6);

    this.filtersData = {
      startDate: sundayDate.toISOString(),
      endDate: saturdayDate.toISOString(),
    };
    this.initializeTable().subscribe();
  }

  updateChartPeriod(period: string): void {
    this.selectedPeriod = period;
    if (period === 'weekly') {
      this.getWeekRangeDates();
    } else if (period === 'monthly') {
      this.getMonthRangeDates();
    }
  }

  getMonthRangeDates() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    this.filtersData = {
      startDate: firstDay.toISOString(),
      endDate: lastDay.toISOString(),
    };
    this.initializeTableMonthly().subscribe();
  }

  initializeTableMonthly() {
    return this.manageTimeAttendanceService.timeAttendancesService
      .getTimeAttendanceList(
        {
          pageIndex: this.pageIndex,
          pageSize: 100,
        },
        this.filtersData
      )
      .pipe(
        tap((res) => {
          // Group data by date for monthly view
          const workTimeByDate: { [key: string]: number } = {};

          res.records.forEach((entry) => {
            const date = new Date(entry.dateTime);
            const dateStr = date.getDate().toString();
            const workTime = parseFloat(entry.totalWorkTime) || 0;
            if (!workTimeByDate[dateStr]) {
              workTimeByDate[dateStr] = 0;
            }
            workTimeByDate[dateStr] += workTime;
          });

          // Create arrays for all days of month
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          const labels: string[] = [];
          const data: number[] = [];

          for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const day = date.getDate().toString().padStart(2, '0');
            const monthStr = (month + 1).toString().padStart(2, '0');
            const dateLabel = `${day}/${monthStr}/${year}`;
            labels.push(dateLabel);
            data.push(workTimeByDate[i.toString()] || 0);
          }

          this.crateChart(data, labels);
        })
      );
  }

  // onOpenCalendarFilter(): void {
  //   const dialogRef = this.dialog.open(CalendarFilterModalComponent, {
  //     width: isSmallDeviceWidthForPopup() ? '500px' : '750px',
  //     maxWidth: '95vw',
  //     height: isSmallDeviceWidthForPopup() ? '100vh' : '80vh',
  //     autoFocus: false,
  //     disableClose: true,
  //     panelClass: 'calendar_filter'
  //   });
  // }
}
