import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDatepickerModule,
  MatDateRangeInput,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/ar';
import * as moment from 'moment-hijri';
import {
  NgxAngularMaterialHijriAdapterService,
  MOMENT_HIJRI_DATE_FORMATS,
  DateLocaleKeys,
} from 'ngx-angular-material-hijri-adapter';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'D/M/YYYY', // Parsing format
  },
  display: {
    dateInput: 'D MMMM YYYY', // Input display format (no comma)
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'D/M/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-picker-hijri',
  // templateUrl: './date-picker-hijri.component.html',
  templateUrl: '../date-picker/date-picker.component.html',
  styleUrls: ['../date-picker/date-picker.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DatePickerHijriComponent,
      multi: true,
    },
    {
      provide: DateAdapter,
      useClass: NgxAngularMaterialHijriAdapterService,
    },
    // Change the format by using `MOMENT_HIJRI_DATE_FORMATS` for Dates and `MOMENT_HIJRI_DATE_TIME_FORMATS` for date/time.
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    // Change the localization to arabic by using `AR_SA` not `AR` only and `EN_US` not `EN` only.
    { provide: MAT_DATE_LOCALE, useValue: DateLocaleKeys.AR_SA },
  ],
})
export class DatePickerHijriComponent implements ControlValueAccessor {
  @Input() formControlName?: string;
  @Input() placeholderStart: string = 'Start date';
  @Input() placeholderEnd: string = 'End date';
  @Input() placeholder: string = 'Select date';
  @Input() range: boolean = false; // false = single date, true = range
  @Input() maxDate?: any; // Accept maxDate as input
  @Input() disabled: boolean = false; // Accept disabled as input
  ngOnChanges() {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  @Output() dateChange = new EventEmitter<Date | { start: Date; end: Date }>();
  @Output() hijriDateChange = new EventEmitter<{ hijriDate: NgbDateStruct }>();

  control = new FormControl();
  private emitTimeout: any;

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    if (value && typeof value === 'string') {
      // Accept both "1447-4-20" and "1447/4/20" formats
      try {
        // const parts = value.split('-');
        const parts = value.split(/[-\/]/);
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // moment months are 0-based
          const day = parseInt(parts[2]);
          // Create a Hijri moment object
          const hijriMoment = moment().iYear(year).iMonth(month).iDate(day);
          this.control.setValue(hijriMoment, { emitEvent: false });
          return;
        }
      } catch (error) {}
    }
    this.control.setValue(value, { emitEvent: false });
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(fn);
    // this.control.valueChanges.subscribe((val) => this.emitDate(val));
    this.control.valueChanges.subscribe((val) => {
      fn(val);
      this.emitDate(val);
    });
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  emitDate(val: any) {
    if (this.range) {
      this.dateChange.emit({ start: val?.start, end: val?.end });
    } else {
      this.dateChange.emit(val);
      // Also emit structured date format
      if (val) {
        const structuredDate = this.convertToStructuredDate(val);
        if (structuredDate) {
          this.hijriDateChange.emit({ hijriDate: structuredDate });
        }
      } else {
        this.hijriDateChange.emit({ hijriDate: { year: 0, month: 0, day: 0 } });
      }
    }
  }

  private convertToStructuredDate(dateValue: any): NgbDateStruct | null {
    if (!dateValue) return null;

    try {
      // If it's a moment object, call the methods to get actual values
      if (dateValue._isAMomentObject) {
        // Try Hijri methods first (for hijri-moment)
        if (typeof dateValue.iYear === 'function') {
          const hijriDate = {
            day: dateValue.iDate(),
            month: dateValue.iMonth() + 1, // iMonth is 0-based
            year: dateValue.iYear(),
          };
          return hijriDate;
        }

        // Fallback to regular moment methods (but these might be Gregorian)
        else if (typeof dateValue.year === 'function') {
          const dateFromMoment = {
            day: dateValue.date(),
            month: dateValue.month() + 1, // month is 0-based
            year: dateValue.year(),
          };
          return dateFromMoment;
        }

        // Try formatting as string approach
        else if (typeof dateValue.format === 'function') {
          const formatted = dateValue.format('YYYY-MM-DD');
          if (formatted && formatted.split !== undefined) {
            return {
              day: parseInt(formatted.split('-')[2]),
              month: parseInt(formatted.split('-')[1]),
              year: parseInt(formatted.split('-')[0]),
            };
          }
        }
      }

      // If it's a string in format 'YYYY-MM-DD' or 'YYYY/MM/DD' - simple like single-hijri-calendar
      if (typeof dateValue === 'string' && dateValue.split !== undefined) {
        const parts = dateValue.split(/[-/]/); // Handle both - and / separators
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);

          // Validate that parsing was successful
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return {
              day: day,
              month: month,
              year: year,
            };
          }
        }
      }

      // If it's already a structured object with actual numeric values (not functions)
      if (
        dateValue.year &&
        dateValue.month &&
        dateValue.day &&
        typeof dateValue.year === 'number' &&
        typeof dateValue.month === 'number' &&
        typeof dateValue.day === 'number'
      ) {
        return {
          day: dateValue.day,
          month: dateValue.month,
          year: dateValue.year,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }
  get parentFormGroup(): FormGroup | null {
    const parent = this.control.parent;
    return parent instanceof FormGroup ? parent : null;
  }
}
