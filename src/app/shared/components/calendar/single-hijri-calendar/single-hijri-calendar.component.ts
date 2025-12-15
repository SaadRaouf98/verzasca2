import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  NgbAlertModule,
  NgbCalendar,
  NgbCalendarIslamicUmalqura,
  NgbDatepickerI18n,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { IslamicI18nService } from '@shared/services/islamicI18n.service';

@Component({
  selector: 'app-single-hijri-calendar',
  standalone: true,
  imports: [NgbDatepickerModule, NgbAlertModule, FormsModule],
  templateUrl: './single-hijri-calendar.component.html',
  styleUrls: ['./single-hijri-calendar.component.scss'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
    { provide: NgbDatepickerI18n, useClass: IslamicI18nService },
  ],
})
export class SingleHijriCalendarComponent {
  @Input() date!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;
  @Input() disabled: boolean = false;

  @Output('hijriSelectedDate') hijriSelectedDate: EventEmitter<{
    hijriDate: NgbDateStruct;
  }> = new EventEmitter<{
    hijriDate: NgbDateStruct;
  }>();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['date'] &&
      changes['date'].currentValue &&
      changes['date'].currentValue.split !== undefined
    ) {
      this.date = {
        day: parseInt(changes['date'].currentValue.split('-')[2]),
        month: parseInt(changes['date'].currentValue.split('-')[1]),
        year: parseInt(changes['date'].currentValue.split('-')[0]),
      };
    }
  }

  onDateChange(date: any) {
    if (!date) {
      this.hijriSelectedDate.emit({
        hijriDate: this.date,
      });
    } else {
      this.hijriSelectedDate.emit({
        hijriDate: this.date,
      });
    }
  }
}

