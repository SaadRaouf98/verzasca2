import { Injectable } from '@angular/core';
import { FilterBuilderService } from '@shared/services/filter-builder.service';
import { MeetingCalenderFormModel } from '@core/models/home/meeting-calender-form.model';
import { EventItem } from '@pages/home/components/home-next-events/home-next-events.component';
import { MeetingsService } from '@core/services/backend-services/meetings.service';

@Injectable({
  providedIn: 'root',
})
export class Service {
  meetingCalender: MeetingCalenderFormModel;
  events: EventItem[] = [];

  constructor(
    private filterBuilderService: FilterBuilderService,
    public meetingsService: MeetingsService,
  ) {
  }

  setMeetingDateRange(from: string, to: string) {
    this.meetingCalender = {
      meetingDateTime : {
        from: from,
        to: to,
      },
    }
  }

  getActiveMeeting() {
    let query = {
      Filter: this.filterBuilderService.buildFilterFromModel(this.meetingCalender),
      RequireTotalCount: true,
      Take: 4,
    };
    this.meetingsService.getActiveNewMeetings(query).subscribe({
      next: (res) => {
        console.log(res);
      }
    })
  }
}
