import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageMyProfileService } from '@pages/my-profile/services/manage-my-profile.service';

import { User, UserStats } from '@pages/my-profile/interfaces/profile';
import { tap } from 'rxjs';
import { ManageTimeAttendanceService } from '@pages/time-attendance/services/manage-time-attendance.service';
import { TimeAttendanceSummary } from '@core/models/time-attendant.model';
import { MatDialog } from '@angular/material/dialog';
import { CalendarFilterModalComponent } from '@pages/home/components/calendar-filter-modal/calendar-filter-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-user-work-info-card',
  templateUrl: './user-work-info-card.component.html',
  styleUrls: ['./user-work-info-card.component.scss'],
})
export class UserWorkInfoCardComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = true;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  userInfo!: User;
  pageIndex: number = 0;
  pageSize: number = 20;
  filtersData: {
    startDate: string;
    endDate: string;
  } = {
    startDate: '',
    endDate: '',
  };
  summary!: TimeAttendanceSummary;
  day = new Date();
  userHasFingerPrint: boolean = true;
  private timerInterval: any;
  todayPunchInTime: string | null = null;
  timeRemaining: string | null = null;
  inTimeAttendance = '';
  active = 'top';
  userStatistics!: UserStats;
  range: {
    fromDate: string;
    toDate: string;
  } = {
    fromDate: '',
    toDate: '',
  };

  constructor(
    private manageMyProfileService: ManageMyProfileService,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private manageTimeAttendanceService: ManageTimeAttendanceService,
    private langugaeService: LanguageService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.getUserStatistics();
    this.getUserInfo();
    this.getTodayInTime().subscribe();
    this.initializeSummary().subscribe();
  }

  initializeSummary() {
    return this.manageTimeAttendanceService.timeAttendancesService
      .getTimeAttendanceSummary(this.filtersData)
      .pipe(
        tap((res) => {
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
          this.inTimeAttendance = this.formatTimeWithAMPM(res.records[0].inTime);
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
    const [hours, minutes, seconds] = this.todayPunchInTime!.split(':').map(Number);
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

        this.timeRemaining = this.formatTime(remainingHours, remainingMinutes, remainingSeconds);
      }
    }, 1000);
  }

  private formatTime(hours: number, minutes: number, seconds: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  private formatTimeWithAMPM(timeString: string): string {
    if (!timeString || timeString === '-') {
      return '0';
    }

    const parts = timeString.split(':').map(Number);
    const hours = parts[0];
    const minutes = parts[1];
    const seconds = parts[2] || 0;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
  }

  getUserInfo() {
    this.manageMyProfileService.getUserInfo().subscribe(
      (userInfo) => {
        // Handle the response here
        this.userInfo = userInfo;
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error(this.translateService.instant('ERROR_MESSAGE'));
      }
    );
  }

  onOpenCalendarFilter(): void {
    const dialogRef = this.dialog.open(CalendarFilterModalComponent, {
      // width: isSmallDeviceWidthForPopup() ? '500px' : '750px',
      // maxWidth: '95vw',
      // height: isSmallDeviceWidthForPopup() ? '100vh' : '80vh',
      // autoFocus: false,
      // disableClose: false,
      // panelClass: 'calendar_filter',\
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        this.range = {
          fromDate: dialogResult.data.fromDate,
          toDate: dialogResult.data.toDate,
        };
        this.getUserStatistics();
        // this.getStatistics(
        //   dialogResult.data.fromDate,
        //   dialogResult.data.toDate
        // );
      }
    });
  }
  getUserStatistics() {
    this.manageMyProfileService.getUserStatistics(this.range).subscribe(
      (userStatistics) => {
        // Handle the response here
        this.userStatistics = userStatistics;
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error(this.translateService.instant('ERROR_MESSAGE'));
      }
    );
  }
}
