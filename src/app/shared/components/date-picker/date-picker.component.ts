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
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY/M/D', // Parsing format
  },
  display: {
    dateInput: 'YYYY/M/D', // Input display format
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY/M/D',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
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
      useExisting: DatePickerComponent,
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  ngOnChanges() {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }
  @Input() formControlName?: string;
  @Input() placeholderStart: string = 'Start date';
  @Input() placeholderEnd: string = 'End date';
  @Input() placeholder: string = 'Select date';
  @Input() range: boolean = false; // false = single date, true = range
  @Input() maxDate?: any; // Accept maxDate as input
  @Input() disabled: boolean = false; // Accept disabled as input

  @Output() dateChange = new EventEmitter<Date | { start: Date; end: Date }>();
  @Output() gregorianDateChange = new EventEmitter<{
    gregorianDate: NgbDateStruct;
  }>();

  control = new FormControl();

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    if (typeof value === 'string') {
      const momentValue = moment(
        value,
        ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DD HH:mm'],
        true
      );

      if (momentValue.isValid()) {
        this.control.setValue(momentValue, { emitEvent: false });
        return;
      }
    }

    this.control.setValue(value, { emitEvent: false });
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(fn);
    this.control.valueChanges.subscribe((val) => this.emitDate(val));
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  emitDate(val: any) {
    if (this.range) {
      this.dateChange.emit({ start: val?.start, end: val?.end });
    } else {
      this.dateChange.emit(val);

      // Also emit structured date format for compatibility with existing handlers
      if (val && moment.isMoment(val)) {
        const structuredDate: NgbDateStruct = {
          day: val.date(),
          month: val.month() + 1, // moment months are 0-based
          year: val.year(),
        };
        this.gregorianDateChange.emit({ gregorianDate: structuredDate });
      }
    }
  }

  get parentFormGroup(): FormGroup | null {
    const parent = this.control.parent;
    return parent instanceof FormGroup ? parent : null;
  }
}
