import { Injectable } from '@angular/core';
import { FilterBuilderService } from '@shared/services/filter-builder.service';
import { MeetingCalenderFormModel } from '@core/models/home/meetings.model';
import { MeetingsService } from '@core/services/backend-services/meetings.service';

@Injectable({
  providedIn: 'root',
})
export class Service {
  constructor(
    private filterBuilderService: FilterBuilderService,
    public meetingsService: MeetingsService,
  ) {
  }

  getActiveMeeting(date: string) {
    let meetingCalender : MeetingCalenderFormModel = {
      meetingDateTime: {
        date: date
      },
    };
    const filter =
      this.filterBuilderService.
      buildFilterFromModel(meetingCalender);
    const query = {
      Filter: filter,
      RequireTotalCount: true,
      Take: 4,
    };
    return this.meetingsService.getActiveNewMeetings(query);
  }
}
