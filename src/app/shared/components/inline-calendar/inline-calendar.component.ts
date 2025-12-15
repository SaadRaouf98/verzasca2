import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { NgbDatepickerI18n, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { I18nService } from '@pages/home/services/i18n.service';
import { CustomDatepickerI18n } from '@pages/home/services/custom-datepicker-i18n.service';

export type CalendarMode = 'single' | 'range';
export type CalendarSelection = Date | { begin: Date; end: Date };

@Component({
  selector: 'app-inline-calendar',
  templateUrl: './inline-calendar.component.html',
  styleUrls: ['./inline-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [I18nService, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }],
})
export class InlineCalendarComponent {
  constructor(public translate: TranslateService) {}
  @Input() mode: CalendarMode = 'single';
  @Input() startAt: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() set selectedDate(value: NgbDateStruct | null) {
    this._selectedDate = value ?? this.today;
  }
  get selectedDate(): NgbDateStruct | null {
    return this._selectedDate;
  }
  private _selectedDate: NgbDateStruct | null = null;

  @Input() range: { begin: Date; end: Date } | null = null;
  @Output() selectionChange = new EventEmitter<CalendarSelection>();

  private pendingStart: NgbDateStruct | null = null;
  private _rangeStruct: { begin: NgbDateStruct; end: NgbDateStruct } | null = null;

  // Always non-null getters so template never sees `null`
  // Use viewDate for controlling the visible month/year in the datepicker
  viewDate: NgbDateStruct | null = null;
  get startDateStruct(): NgbDateStruct {
    return this.viewDate ?? this.toStruct(this.startAt ?? new Date());
  }

  get minDateStruct(): NgbDateStruct {
    return this.toStruct(this.minDate ?? new Date(1900, 0, 1));
  }

  get maxDateStruct(): NgbDateStruct {
    return this.toStruct(this.maxDate ?? new Date(2099, 11, 31));
  }

  today = inject(NgbCalendar).getToday();

  months: { value: number; displayText: string }[] = [];
  years: { value: number; displayText: string }[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    if (!this._selectedDate) {
      this._selectedDate = this.today;
      this.currentMonth = this.today.month - 1; // Convert to 0-indexed
      this.currentYear = this.today.year;
    } else {
      this.currentMonth = this._selectedDate.month - 1;
      this.currentYear = this._selectedDate.year;
    }
    this.months = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      displayText: this.translate.instant('shared.months.' + (i + 1)),
    }));
    this.viewDate = { year: this.currentYear, month: this.currentMonth + 1, day: 1 };
    this.initializeYearRange();
  }

  private initializeYearRange() {
    const minYear = this.minDateStruct.year;
    const maxYear = this.maxDateStruct.year;
    this.years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
      const year = minYear + i;
      return { value: year, displayText: year.toString() };
    });
  }

  onMonthChange(selected: any) {
    // app-select emits the selected object or value
    const selectedMonth = typeof selected === 'object' ? selected.value : selected;
    this.currentMonth = selectedMonth;
    this.viewDate = { year: this.currentYear, month: this.currentMonth + 1, day: 1 };
    this.updateStartDate(new Date(this.currentYear, selectedMonth, 1));
  }

  onYearChange(selected: any) {
    const selectedYear = typeof selected === 'object' ? selected.value : selected;
    this.currentYear = selectedYear;
    this.viewDate = { year: this.currentYear, month: this.currentMonth + 1, day: 1 };
    this.updateStartDate(new Date(selectedYear, this.currentMonth, 1));
  }

  private updateStartDate(date: Date) {
    const struct = this.toStruct(date);
    this._selectedDate = { ...struct, day: this._selectedDate?.day || 1 };
  }

  onDateSelect(date: NgbDateStruct) {
    this._selectedDate = date;
    if (this.mode === 'single') {
      const d = this.toDate(date);
      this.selectionChange.emit(d);
      return;
    }
    // — range logic —
    if (!this.pendingStart || this._rangeStruct) {
      this.pendingStart = date;
      this._rangeStruct = { begin: date, end: date };
      const d0 = this.toDate(date);
      this.selectionChange.emit({ begin: d0, end: d0 });
    } else {
      const start = this.pendingStart;
      const end = this.compare(date, start) >= 0 ? date : start;
      this._rangeStruct = { begin: start, end };
      this.pendingStart = null;
      this.selectionChange.emit({
        begin: this.toDate(this._rangeStruct.begin),
        end: this.toDate(this._rangeStruct.end),
      });
    }
  }

  isSelected(date: NgbDateStruct): boolean {
    if (!this._selectedDate) return false;
    return (
      date.day === this._selectedDate.day &&
      date.month === this._selectedDate.month &&
      date.year === this._selectedDate.year
    );
  }

  isInRange(date: NgbDateStruct) {
    if (!this._rangeStruct) return false;
    const t = this.toDate(date).getTime();
    const b = this.toDate(this._rangeStruct.begin).getTime();
    const e = this.toDate(this._rangeStruct.end).getTime();
    return t >= b && t <= e;
  }

  isRangeStart(date: NgbDateStruct) {
    return !!this._rangeStruct && this.compare(date, this._rangeStruct.begin) === 0;
  }

  isRangeEnd(date: NgbDateStruct) {
    return !!this._rangeStruct && this.compare(date, this._rangeStruct.end) === 0;
  }

  isToday(date: NgbDateStruct): boolean {
    return (
      date.day === this.today.day &&
      date.month === this.today.month &&
      date.year === this.today.year
    );
  }

  private toStruct(d: Date): NgbDateStruct {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  private toDate(s: NgbDateStruct): Date {
    return new Date(s.year, s.month - 1, s.day);
  }

  private compare(a: NgbDateStruct, b: NgbDateStruct): number {
    return this.toDate(a).getTime() - this.toDate(b).getTime();
  }
}
