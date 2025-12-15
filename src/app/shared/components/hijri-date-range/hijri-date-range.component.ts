import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { LanguageService } from '@core/services/language.service';
import * as moment from 'moment';
import {
  DateLocaleKeys,
  MOMENT_HIJRI_DATE_FORMATS,
  NgxAngularMaterialHijriAdapterService,
} from 'ngx-angular-material-hijri-adapter';

@Component({
  selector: 'app-hijri-date-range',
  templateUrl: './hijri-date-range.component.html',
  styleUrls: ['./hijri-date-range.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: NgxAngularMaterialHijriAdapterService,
    },
    // Change the format by using `MOMENT_HIJRI_DATE_FORMATS` for Dates and `MOMENT_HIJRI_DATE_TIME_FORMATS` for date/time.
    { provide: MAT_DATE_FORMATS, useValue: MOMENT_HIJRI_DATE_FORMATS },
    // Change the localization to arabic by using `AR_SA` not `AR` only and `EN_US` not `EN` only.
    { provide: MAT_DATE_LOCALE, useValue: DateLocaleKeys.AR_SA },
  ],
})
export class HijriDateRangeComponent implements OnInit, OnChanges {
  form!: FormGroup;
  placeholder: string = 'shared.day/month/year';
  lang: string = 'ar';

  @Input() date!: {
    hijriFromDate: string;
    hijriToDate: string;
  };

  @Input() hasLabel: boolean = true;

  @Output('submit') submit: EventEmitter<{
    hijriFromDate: string;
    hijriToDate: string;
    hijriFromDateDisplayedText: string | undefined;
    hijriToDateDisplayedText: string | undefined;
  }> = new EventEmitter<{
    hijriFromDate: string;
    hijriToDate: string;
    hijriFromDateDisplayedText: string | undefined;
    hijriToDateDisplayedText: string | undefined;
  }>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;

    if (this.lang === 'en') {
      this.placeholder = 'shared.englishDay/month/year';
    }

    this.initializeForm();
    if (this.date) {
      this.patchForm();
    }
  }

  ngOnChanges(changes: { date: SimpleChange }) {
    if (this.form && changes.date && changes.date.currentValue) {
      this.form.patchValue({
        fromDate: changes.date.currentValue.hijriFromDate,
        toDate: changes.date.currentValue.hijriToDate,
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
    });
  }

  patchForm(): void {
    this.form.patchValue({
      fromDate: this.date.hijriFromDate,
      toDate: this.date.hijriToDate,
    });
  }

  onDateChanges(e: any): void {
    const { fromDate, toDate } = this.form.value;

    //Only submit when both start end date both have values
    if (fromDate && toDate) {
      const data = {
        hijriFromDate: fromDate.lang ? fromDate.lang('en') : fromDate, //.format('DD-MM-yyyy'),
        hijriToDate: toDate.lang ? toDate.lang('en') : toDate,
        hijriFromDateDisplayedText: document
          .getElementById('hijri-start')
          ?.parentNode?.querySelector('span')?.innerHTML,
        hijriToDateDisplayedText: e.targetElement.value, //"١٩ ربيع الثاني، ١٤٤٥"
      };
      this.submit.emit(data);
    }

    /* let hijriStart = document
      .getElementById('hijri-start')
      ?.parentNode?.querySelector('span')?.innerHTML;
    let hijriEnd = document
      .getElementById('hijri-end')
      ?.parentNode?.querySelector('span')?.innerHTML;
    if (hijriStart && hijriEnd) {
      let {
        day: hijriStartDay,
        month: hijriStartMonth,
        year: hijriStartYear,
      } = this.splitHijriDate(hijriStart);
      let {
        day: hijriEndDay,
        month: hijriEndMonth,
        year: hijriEndYear,
      } = this.splitHijriDate(hijriEnd);
      hijriStartDay = this.mapArabicNumberDigitsToEnglish(hijriStartDay);
      hijriEndDay = this.mapArabicNumberDigitsToEnglish(hijriEndDay);
      hijriStartYear = this.mapArabicNumberDigitsToEnglish(hijriStartYear);
      hijriEndYear = this.mapArabicNumberDigitsToEnglish(hijriEndYear);
    }

    if (this.form.value.toDate) {
      const data = {
        hijriFromDate: moment(this.form.value.fromDate).format('DD-MM-yyyy'),
        hijriToDate: moment(this.form.value.toDate).format('DD-MM-yyyy'),
      };
      this.submit.emit({
        hijriFromDate: moment(this.form.value.fromDate).format('DD-MM-yyyy'),
        hijriToDate: moment(this.form.value.toDate).format('DD-MM-yyyy'),
      });
    } */
  }

  private splitHijriDate(arabicDateText: string): {
    day: string;
    month: string;
    year: string;
  } {
    arabicDateText = arabicDateText.replace('،', '');
    const dateArray = arabicDateText.split(' ');
    const day = dateArray[0]; //١٦
    const year = dateArray[dateArray.length - 1]; //'١٤٤٥'
    const month =
      dateArray.length > 3 ? `${dateArray[1]} ${dateArray[2]}` : dateArray[1]; //ربيع الثاني
    return {
      day, //١٦
      month, //ربيع الثاني
      year, //'١٤٤٥'
    };
  }

  private mapArabicNumberDigitsToEnglish(num: string): string {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    for (var i = 0; i < 10; i++) {
      num = num.replaceAll(arabicNumbers[i], englishNumbers[i] + '');
    }
    return num;
  }

  private mapArabicMonthsToEnglish(num: string): string {
    return '';
  }
}

