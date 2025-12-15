import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  NgbCalendar,
  NgbCalendarIslamicUmalqura,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbDatepickerI18n,
  NgbDatepickerModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { IslamicI18nService } from '@shared/services/islamicI18n.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-range-hijri-calendar',
  standalone: true,
  imports: [NgbDatepickerModule, FormsModule, MatDatepickerModule],
  templateUrl: './range-hijri-calendar.component.html',
  styleUrls: ['./range-hijri-calendar.component.scss'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
    { provide: NgbDatepickerI18n, useClass: IslamicI18nService },
  ],
})
export class RangeHijriCalendarComponent implements OnChanges {
  calendar = inject(NgbCalendar);

  @Input() fromDateStr: string | null = null;
  @Input() toDateStr: string | null = null;

  @Input() fromDate: NgbDate | null = null;
  @Input() toDate: NgbDate | null = null;

  @Output('dateChange') dateChange: EventEmitter<{
    fromDate: NgbDate | null;
    toDate: NgbDate | null;
  }> = new EventEmitter<{
    fromDate: NgbDate | null;
    toDate: NgbDate | null;
  }>();

  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.dateChange.emit({
      fromDate: this.fromDate,
      toDate: this.toDate,
    });
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(
    currentValue: NgbDate | null,
    input: string,
    type: 'fromDate' | 'toDate'
  ): NgbDate | null {
    const parsed = this.formatter.parse(input);
    if (!parsed && type === 'fromDate') {
      this.dateChange.emit({
        fromDate: null,
        toDate: this.toDate,
      });
    }

    if (!parsed && type === 'toDate') {
      this.dateChange.emit({
        fromDate: this.fromDate,
        toDate: null,
      });
    }

    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['fromDateStr'] &&
      changes['fromDateStr'].currentValue &&
      changes['fromDateStr'].currentValue.split !== undefined
    ) {
      const day = parseInt(changes['fromDateStr'].currentValue.split('-')[2]);
      const month = parseInt(changes['fromDateStr'].currentValue.split('-')[1]);
      const year = parseInt(changes['fromDateStr'].currentValue.split('-')[0]);

      this.fromDate = new NgbDate(year, month, day);
    }

    if (changes['fromDateStr'] && !changes['fromDateStr'].currentValue) {
      this.fromDate = null;
    }

    if (
      changes['toDateStr'] &&
      changes['toDateStr'].currentValue &&
      changes['toDateStr'].currentValue.split !== undefined
    ) {
      const day = parseInt(changes['toDateStr'].currentValue.split('-')[2]);
      const month = parseInt(changes['toDateStr'].currentValue.split('-')[1]);
      const year = parseInt(changes['toDateStr'].currentValue.split('-')[0]);

      this.toDate = new NgbDate(year, month, day);
      return;
    }

    if (changes['toDateStr'] && !changes['toDateStr'].currentValue) {
      this.toDate = null;
    }
  }
}

