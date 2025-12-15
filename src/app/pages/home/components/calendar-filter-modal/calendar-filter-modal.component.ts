import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { StatisticsTimePeriod } from '@pages/home/enums/statistics-time-period.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

import { from } from 'rxjs';
import { CustomDatepickerI18n } from '@pages/home/services/custom-datepicker-i18n.service';
import { I18nService } from '@pages/home/services/i18n.service';
import moment from 'moment';
@Component({
  selector: 'app-calendar-filter-modal',
  templateUrl: './calendar-filter-modal.component.html',
  styleUrls: ['./calendar-filter-modal.component.scss'],
  providers: [I18nService, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }], // define custom NgbDatepickerI18n provider
})
export class CalendarFilterModalComponent {
  calendar = inject(NgbCalendar);
  fb = inject(FormBuilder);

  hoveredDate: NgbDate | null = null;
  filterForm!: FormGroup;

  fromDate: string = null;
  toDate: string = null;

  // StatisticsTimePeriod = StatisticsTimePeriod;
  // timePeriodOption: StatisticsTimePeriod | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestId: string;
    },
    private dialogRef: MatDialogRef<CalendarFilterModalComponent>,
    private toastr: CustomToastrService
  ) {}

  // onDateSelection(date: NgbDate): void {
  //   if (!this.fromDate && !this.toDate) {
  //     this.fromDate = date;
  //   } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
  //     this.toDate = date;
  //   } else {
  //     this.toDate = null;
  //     this.fromDate = date;
  //   }
  // }

  // onSelectedTimePeriodChanges(e: MatRadioChange): void {}

  // isHovered(date: NgbDate) {
  //   return (
  //     this.fromDate &&
  //     !this.toDate &&
  //     this.hoveredDate &&
  //     date.after(this.fromDate) &&
  //     date.before(this.hoveredDate)
  //   );
  // }

  // isInside(date: NgbDate) {
  //   return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  // }

  // isRange(date: NgbDate) {
  //   return (
  //     date.equals(this.fromDate) ||
  //     (this.toDate && date.equals(this.toDate)) ||
  //     this.isInside(date) ||
  //     this.isHovered(date)
  //   );
  // }

  onSubmit(): void {
    // if (!this.filterForm.valid) {
    //   this.toastr.warning('عفوا يجب اختيار فترة زمنية');
    //   return;
    // }

    // const fromDateValue = this.filterForm.get('fromDate')?.value;
    // const toDateValue = this.filterForm.get('toDate')?.value;

    let fromDate = '';
    let toDate = '';

    if (!this.fromDate && !this.toDate) {
      this.toastr.warning('عفوا يجب اختيار فترة زمنية');
      return;
    }

    // Normalize and validate dates using English locale so numerals parse correctly.
    const mFrom = moment(String(this.fromDate)).locale('en');
    let mTo = moment(String(this.toDate)).locale('en');

    if (!mTo.isValid()) {
      mTo = moment(String(new Date())).locale('en');
    }

    if (mFrom.isAfter(mTo)) {
      this.toastr.warning('عفوا، تاريخ البدء يجب أن يكون قبل أو يساوي تاريخ الانتهاء');
      return;
    }

    fromDate = mFrom.format('YYYY-MM-DD');
    toDate = mTo.format('YYYY-MM-DD');
    console.log('this.fromDate', fromDate);
    console.log('this.toDate', toDate);

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        fromDate,
        toDate,
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
