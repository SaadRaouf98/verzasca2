import { CommonModule } from '@angular/common';
import {  Component, inject, Input, LOCALE_ID, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
const today = new Date();
const month = today.getMonth();
const year = today.getFullYear();

@Component({
  selector: 'app-date-picker-range',
  templateUrl: './date-picker-range.component.html',
  styleUrls: ['./date-picker-range.component.scss'],
})

export class DatePickerRangeComponent {
@Input() placeholder =''
readonly campaignOne = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  readonly campaignTwo = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
}
