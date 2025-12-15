import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  DateLocaleKeys,
  MOMENT_HIJRI_DATE_FORMATS,
  NgxAngularMaterialHijriAdapterService,
} from 'ngx-angular-material-hijri-adapter';
import {
  NgbAlertModule,
  NgbCalendar,
  NgbCalendarIslamicUmalqura,
  NgbDateStruct,
  NgbDatepickerI18n,
  NgbDatepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { IslamicI18nService } from '@shared/services/islamicI18n.service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { debounceTime, map } from 'rxjs';
import { UmAlQuraCalendarService } from '@core/services/backend-services/um-al-qura-calendar.service';
@Component({
  selector: 'app-hijri-calendar-modal',
  templateUrl: './hijri-calendar-modal.component.html',
  styleUrls: ['./hijri-calendar-modal.component.scss'],
  standalone: true,
  imports: [
    NgbDatepickerModule,
    NgbAlertModule,
    FormsModule,
    RangeHijriCalendarComponent,
  ],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
    { provide: NgbDatepickerI18n, useClass: IslamicI18nService },
    FromDateToDateSearchService,
  ],
})
export class HijriCalendarModalComponent {
  filtersForm!: FormGroup;
  differenceInDays: number = 0;
  gregorianToday: NgbDateStruct = {
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  hijriToday!: NgbDateStruct;

  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);

  constructor(
    private dialogRef: MatDialogRef<HijriCalendarModalComponent>,
    private umAlQuraCalendarService: UmAlQuraCalendarService
  ) {}

  ngOnInit(): void {
    this.setCurrenTodayHijriDate();
    this.initializeFiltersForm();
    this.detectFiltersChanges();
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
    });
  }

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (value.fromDate && value.toDate) {
            this.differenceInDays =
              this.getDateDifference(value.fromDate, value.toDate) + 1;
          } else {
            this.differenceInDays = 0;
          }
        })
      )
      .subscribe();
  }

  setCurrenTodayHijriDate(): void {
    this.umAlQuraCalendarService
      .getHijriDate(
        `${this.gregorianToday.year}/${this.gregorianToday.month}/${this.gregorianToday.day}`
      )
      .subscribe({
        next: (res) => {
          this.hijriToday = {
            day: parseInt(res.split('/')[2]),
            month: parseInt(res.split('/')[1]),
            year: parseInt(res.split('/')[0]),
          };
        },
      });
  }
  getDateDifference(date1: string, date2: string): number {
    const date1Obj = new Date(date1);
    const date2Obj = new Date(date2);

    // Calculate the difference in milliseconds
    const diffInMs = date2Obj.getTime() - date1Obj.getTime();

    // Convert milliseconds to days
    return diffInMs / (1000 * 60 * 60 * 24);
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
///
