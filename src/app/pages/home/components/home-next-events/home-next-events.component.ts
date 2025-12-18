import {
  Component,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Service } from '@pages/home/service';
import { EventItem } from '@core/models/home/meetings.model';


@Component({
  selector: 'app-home-next-events',
  templateUrl: './home-next-events.component.html',
  styleUrls: ['./home-next-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNextEventsComponent {
  events: EventItem[];

  constructor(
    private datePipe: DatePipe,
    private _internalService: Service,
    private cdr: ChangeDetectorRef,
  ) {
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.loadMeetings(today)
  }

  loadMeetings(date: string) {
    this._internalService.getActiveMeeting(date).subscribe({
      next: (res: any) => {
        this.events = res.data;
        this.cdr.detectChanges();
      },
    });
  }

  onCalendarDateChange(date: Date) {
    let selectedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.loadMeetings(selectedDate)
  }

}
