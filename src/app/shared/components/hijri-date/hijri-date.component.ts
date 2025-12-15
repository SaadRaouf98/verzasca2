import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Self,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { isTouched } from '@shared/helpers/helpers';
import { SharedModule } from '@shared/shared.module';
import * as moment from 'moment';
import {
  DateLocaleKeys,
  MOMENT_HIJRI_DATE_FORMATS,
  NgxAngularMaterialHijriAdapterModule,
  NgxAngularMaterialHijriAdapterService,
} from 'ngx-angular-material-hijri-adapter';

@Component({
  selector: 'app-hijri-date',
  templateUrl: './hijri-date.component.html',
  styleUrls: ['./hijri-date.component.scss'],
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
  /*   imports: [
    NgxAngularMaterialHijriAdapterModule,
    CommonModule,
    FormsModule,
    SharedModule,
  ],
  standalone: true, */
})
export class HijriDateComponent implements OnInit, OnChanges {
  form!: FormGroup;
  @Input() date!: string;
  @Input() isFieldRequired!: boolean;
  @Input() isFieldDisabled!: boolean;
  @Input() maxDate!: Date;

  @ViewChild('hijriDateInput', { static: false }) hijriDateInput!: ElementRef;
  @Output('submit') submit: EventEmitter<{
    hijriDate: string;
    hijriDateDisplayedText: string | undefined;
  }> = new EventEmitter<{
    hijriDate: string;
    hijriDateDisplayedText: string | undefined;
  }>();

  constructor() {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.date) {
      this.patchForm();
    }
    if (this.isFieldDisabled) {
      this.form.get('date')?.disable();
    }

    this.detectDateChanges();
  }

  detectDateChanges(): void {
    this.form.get('date')?.valueChanges.subscribe((e: any) => {
      if (e) {
        const data = {
          hijriDate: e.lang ? e.lang('en') : e, //.format('DD-MM-yyyy'),
          hijriDateDisplayedText:
            this.hijriDateInput.nativeElement.parentNode?.querySelector('span')
              ?.innerHTML,
        };
        this.submit.emit(data);
      }
    });
  }

  ngOnChanges(changes: {
    date: SimpleChange;
    isFieldRequired: SimpleChange;
    isFieldDisabled: SimpleChange;
  }): void {
    if (this.form && changes.date && changes.date.currentValue) {
      this.form.patchValue({
        date: changes.date.currentValue,
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      date: new FormControl(''),
    });
  }

  patchForm(): void {
    this.form.patchValue({
      date: this.date,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }
}
