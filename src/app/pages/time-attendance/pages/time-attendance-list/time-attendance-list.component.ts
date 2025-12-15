import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LanguageService } from '@core/services/language.service';
import {
  formatDateToYYYYMMDD,
  isSmallDeviceWidthForTable,
} from '@shared/helpers/helpers';
import { debounceTime, map, tap } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';
import {
  TimeAttendanceSummary,
  TimeAttendant,
} from '@core/models/time-attendant.model';
import { ManageTimeAttendanceService } from '@pages/time-attendance/services/manage-time-attendance.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TimeFilterType } from '@core/enums/time-filter-type.enum';
import { Observable } from 'tinymce';
import { DayOfWeek } from '@core/enums/day-of-week.enum';

@Component({
  selector: 'app-time-attendance-list',
  templateUrl: './time-attendance-list.component.html',
  styleUrls: ['./time-attendance-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TimeAttendanceListComponent implements OnInit {
  timeAttendanceSource: MatTableDataSource<TimeAttendant> =
    new MatTableDataSource<TimeAttendant>([]);

  summary!: TimeAttendanceSummary;
  DayOfWeek = DayOfWeek;

  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  displayedColumns: string[] = [];
  isLoadingTable: boolean = true;
  isLoadingSummary: boolean = true;

  expandedElement!: TimeAttendant | null;
  lang: string = 'ar';
  userHasFingerPrint: boolean = true;

  form!: FormGroup;
  filtersData: {
    startDate: string;
    endDate: string;
  } = {
    startDate: '',
    endDate: '',
  };

  TimeFilterType = TimeFilterType;

  day = new Date();
  firstWeekDay!: Date;
  lastWeekDay!: Date;
  firstMonthDay!: Date;
  lastMonthDay!: Date;

  todayPunchInTime: string | null = null;
  timeRemaining: string | null = null;

  readonly setHourNumber = 5; //just random number needed to solve problems when converting date to toIsoString
  private timerInterval: any;

  constructor(
    private langugaeService: LanguageService,
    private manageTimeAttendanceService: ManageTimeAttendanceService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initalizeTable().subscribe();
    this.initializeSummary().subscribe();
    this.initializeDateFiltersForm();
    this.initializeDropDownData();

    this.detectTimeFilterChanges();
    this.getTodayInTime().subscribe();
  }

  initalizeTable() {
    this.isLoadingTable = true;
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
          this.isLoadingTable = false;
          this.userHasFingerPrint = res.hasFingerPrint;
          this.timeAttendanceSource = new MatTableDataSource(res.records);
          this.length = res.total;
        })
      );
  }

  initializeSummary() {
    this.isLoadingSummary = true;
    return this.manageTimeAttendanceService.timeAttendancesService
      .getTimeAttendanceSummary(this.filtersData)
      .pipe(
        tap((res) => {
          this.isLoadingSummary = false;
          this.summary = res;
        })
      );
  }

  getTodayInTime() {
    return this.manageTimeAttendanceService.timeAttendancesService
      .getTimeAttendanceList(
        {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
        },
        {
          startDate: this.day.toISOString(),
          endDate: this.day.toISOString(),
        }
      )
      .pipe(
        tap((res) => {
          /* res.records.push({
            id: '',
            dateTime: '',
            dayOfWeek: DayOfWeek.Monday,
            inTime: '11:26:33',
            outTime: '',
            normalRegular: '',
            normalOverTime: '',
            totalWorkTime: '',
          });
 */
          if (
            this.userHasFingerPrint &&
            res.records.length &&
            res.records[0].inTime &&
            res.records[0].inTime !== '-'
          ) {
            this.todayPunchInTime = res.records[0].inTime;
            this.startCountdown();
          }
        })
      );
  }

  startCountdown() {
    const [hours, minutes, seconds] =
      this.todayPunchInTime!.split(':').map(Number);
    const punchInDate = new Date();
    punchInDate.setHours(hours, minutes, seconds);

    const endTime = new Date(punchInDate.getTime() + 8 * 60 * 60 * 1000);

    this.timerInterval = setInterval(() => {
      const now = new Date();
      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        clearInterval(this.timerInterval);
        this.timeRemaining = '00:00:00';
      } else {
        const remainingHours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const remainingMinutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const remainingSeconds = Math.floor((timeDiff / 1000) % 60);

        this.timeRemaining = this.formatTime(
          remainingHours,
          remainingMinutes,
          remainingSeconds
        );
      }
    }, 1000);
  }

  initializeDateFiltersForm(): void {
    this.form = new FormGroup({
      timeFilterSelect: new FormControl('', [Validators.required]),
      startDate: new FormControl('', []),
      endDate: new FormControl('', []),
    });
  }

  initializeDropDownData(): void {
    const currentDay = new Date();
    const first = currentDay.getDate() - currentDay.getDay(); // First day (Sunday) is the day of the month - the day of the week
    const last = first + 4; // last day (Thursday) is the first day + 4

    this.firstWeekDay = new Date(currentDay.setDate(first));
    this.lastWeekDay = new Date(currentDay.setDate(last));

    this.firstMonthDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      1,
      this.setHourNumber //any hour but required to avoid when convert to (toISOString)
    );

    this.lastMonthDay = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth() + 1,
      0,
      this.setHourNumber //any hour but required to avoid when convert to (toISOString)
    );
    //
  }

  detectTimeFilterChanges() {
    this.form
      .get('timeFilterSelect')
      ?.valueChanges.pipe(
        debounceTime(200),
        map((value: TimeFilterType) => {
          if (value === TimeFilterType.Custom) {
            this.handleCustomPeriod();
            return;
          }

          if (value === TimeFilterType.Daily) {
            this.filtersData.startDate = this.day.toISOString();
            this.filtersData.endDate = this.day.toISOString();
          } else if (value === TimeFilterType.Weekly) {
            this.filtersData.startDate = this.firstWeekDay.toISOString();
            this.filtersData.endDate = this.lastWeekDay.toISOString();
          } else if (value === TimeFilterType.Monthly) {
            this.filtersData.startDate = this.firstMonthDay.toISOString();
            this.filtersData.endDate = this.lastMonthDay.toISOString();
          }
          this.initalizeTable().subscribe();
          this.initializeSummary().subscribe();
        })
      )
      .subscribe();

    [this.form.get('startDate'), this.form.get('endDate')].map((ele) => {
      ele?.valueChanges
        .pipe(
          debounceTime(200),
          map((value: Date) => {
            this.handleCustomPeriod();
          })
        )
        .subscribe();
    });
  }

  private handleCustomPeriod() {
    const { startDate, endDate } = this.form.value;

    if (startDate instanceof Date) {
      startDate.setHours(this.setHourNumber);
      this.filtersData.startDate = startDate.toISOString();
    } else {
      this.filtersData.startDate = '';
    }

    if (endDate instanceof Date) {
      endDate.setHours(this.setHourNumber);
      this.filtersData.endDate = endDate.toISOString();
    } else {
      this.filtersData.endDate = '';
    }

    this.initalizeTable().subscribe();
    this.initializeSummary().subscribe();
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
  }

  view_hide_element(element: TimeAttendant): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: TimeAttendant): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['datetime', 'inTime', 'outTime'];
    } else {
      return [
        'dayOfWeek',
        'dateTime',
        'inTime',
        'outTime',
        'normalRegular',
        'normalOverTime',
        'totalWorkTime',
      ];
    }
  }

  private formatTime(hours: number, minutes: number, seconds: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
