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
import { CalendarFilterModalComponent } from '@pages/home/components/calendar-filter-modal/calendar-filter-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-numbers-and-transactions-card',
  templateUrl: './numbers-and-transactions-card.component.html',
  styleUrls: ['./numbers-and-transactions-card.component.scss'],
})
export class NumbersAndTransactionsCardComponent implements OnInit {
  form!: FormGroup;
  isLoading: boolean = true;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  userStatistics!: UserStats;
  range: {
    fromDate: string;
    toDate: string;
  } = {
    fromDate: '',
    toDate: '',
  };

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
  active = 'top';
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
  }

  onOpenCalendarFilter(): void {
    const dialogRef = this.dialog.open(CalendarFilterModalComponent, {
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: true,
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
