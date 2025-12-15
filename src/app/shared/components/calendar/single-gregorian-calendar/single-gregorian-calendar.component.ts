import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-gregorian-calendar',
  standalone: true,
  imports: [NgbDatepickerModule, FormsModule],
  templateUrl: './single-gregorian-calendar.component.html',
  styleUrls: ['./single-gregorian-calendar.component.scss'],
})
export class SingleGregorianCalendarComponent implements OnChanges {
  @Input() date!: NgbDateStruct;
  @Input() maxDate!: NgbDateStruct;
  @Input() disabled: boolean = false;

  @Output('gregorianSelectedDate') gregorianSelectedDate: EventEmitter<{
    gregorianDate: NgbDateStruct;
  }> = new EventEmitter<{
    gregorianDate: NgbDateStruct;
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
      this.gregorianSelectedDate.emit({
        gregorianDate: this.date,
      });
    } else {
      this.gregorianSelectedDate.emit({
        gregorianDate: this.date,
      });
    }
  }
}

