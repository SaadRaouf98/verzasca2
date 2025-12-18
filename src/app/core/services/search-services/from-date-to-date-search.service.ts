import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { UmAlQuraCalendarService } from '../backend-services/um-al-qura-calendar.service';

@Injectable({
  providedIn: 'root',
})
export class FromDateToDateSearchService {
  constructor(private umAlQuraCalendarService: UmAlQuraCalendarService) {}

  onGregorianDateChanges(
    filtersForm: FormGroup,
    hijriDateCalendarInput?: {
      hijriFromDate: string;
      hijriToDate: string;
    }
  ): void {
    const { fromDate, toDate } = filtersForm.value;

    if (fromDate && toDate) {
      const formattedFromDate = moment(fromDate).format('yyyy-MM-DD');
      const formattedToDate = moment(toDate).format('yyyy-MM-DD');

      filtersForm.patchValue({
        hijriFromDate: formattedFromDate,
        hijriToDate: formattedToDate,
      });

      if (hijriDateCalendarInput) {
        hijriDateCalendarInput = {
          hijriFromDate: formattedFromDate,
          hijriToDate: formattedToDate,
        };
      }
    }
  }

  onGregorianDateChanges2(
    filtersForm: FormGroup,
    date: {
      fromDate: NgbDateStruct | null;
      toDate: NgbDateStruct | null;
    }
  ): void {
    // Handle fromDate
    if (date.fromDate && typeof date.fromDate === 'object') {
      this.umAlQuraCalendarService
        .getHijriDate(`${date.fromDate.year}/${date.fromDate.month}/${date.fromDate.day}`, true)
        .subscribe({
          next: (res) => {
            filtersForm.patchValue({
              fromDate: `${date.fromDate.year}-${date.fromDate.month}-${date.fromDate.day}`,
              hijriFromDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
            });
          },
          error: (err) => {},
        });
    }

    // Handle toDate
    if (date.toDate && typeof date.toDate === 'object') {
      this.umAlQuraCalendarService
        .getHijriDate(`${date.toDate.year}/${date.toDate.month}/${date.toDate.day}`, true)
        .subscribe({
          next: (res) => {
            filtersForm.patchValue({
              toDate: `${date.toDate.year}-${date.toDate.month}-${date.toDate.day}`,
              hijriToDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
            });
          },
        });
    }

    // If fromDate is a string, do not patch it again
    if (!date.fromDate) {
      filtersForm.patchValue({
        hijriFromDate: '',
        fromDate: '',
      });
    }

    if (!date.toDate) {
      filtersForm.patchValue({
        hijriToDate: '',
        toDate: '',
      });
    }
  }

  onHijriDateChanges2(
    filtersForm: FormGroup,
    date: {
      fromDate: NgbDateStruct | null;
      toDate: NgbDateStruct | null;
    }
  ): void {
    // Handle fromDate
    if (date.fromDate && typeof date.fromDate === 'object') {
      this.umAlQuraCalendarService
        .getGregorianDate(`${date.fromDate.year}/${date.fromDate.month}/${date.fromDate.day}`, true)
        .subscribe({
          next: (res) => {
            filtersForm.patchValue({
              hijriFromDate: `${date.fromDate.year}-${date.fromDate.month}-${date.fromDate.day}`,
              fromDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
            });
          },
        });
    }

    // Handle toDate
    if (date.toDate && typeof date.toDate === 'object') {
      this.umAlQuraCalendarService
        .getGregorianDate(`${date.toDate.year}/${date.toDate.month}/${date.toDate.day}`, true)
        .subscribe({
          next: (res) => {
            filtersForm.patchValue({
              hijriToDate: `${date.toDate.year}-${date.toDate.month}-${date.toDate.day}`,
              toDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
            });
          },
        });
    }

    // If fromDate is null, clear
    if (!date.fromDate) {
      filtersForm.patchValue({
        hijriFromDate: '',
        fromDate: '',
      });
    }

    // If toDate is null, clear
    if (!date.toDate) {
      filtersForm.patchValue({
        hijriToDate: '',
        toDate: '',
      });
    }
  }

  onPatchFormHijriDate(
    date: {
      hijriFromDate: string;
      hijriToDate: string;
      hijriFromDateDisplayedText: string | undefined;
      hijriToDateDisplayedText: string | undefined;
    },
    filtersForm: FormGroup
  ): void {
    filtersForm.patchValue({
      hijriFromDate: date.hijriFromDate,
      hijriToDate: date.hijriToDate,
      fromDate: new Date(date.hijriFromDate),
      toDate: new Date(date.hijriToDate),
    });
  }
}
