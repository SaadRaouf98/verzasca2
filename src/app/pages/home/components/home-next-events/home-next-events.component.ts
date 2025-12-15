// home-next-events.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Service } from '@pages/home/service';
import { MeetingCalenderFormModel } from '@core/models/home/meeting-calender-form.model';

export interface EventItem {
  title: string;
  startTime: string; // e.g. "05:00"
  endTime: string; // e.g. "07:00"
  date: Date;
}

export interface MeetingGroup {
  date: string; // ISO date string for the group
  meetings: Meeting[];
}

interface Meeting {
  id: string;
  meetingType: number;
  title: string; // e.g. "عنوان 1"
  meetingDateTime: string; // e.g. "2024-02-16T05:00:00"
  isVirtual: boolean;
  memberCount: number;
  containersCount: number;
  attendanceCount: number;
  durationInMinutes: number; // e.g. 120
  status: number;
  committee: {
    id: string;
    title: string;
    titleEn: string;
    committeeSymbol: string;
    date: string;
    admin: any;
  };
}

@Component({
  selector: 'app-home-next-events',
  templateUrl: './home-next-events.component.html',
  styleUrls: ['./home-next-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNextEventsComponent {
  get events(): EventItem[] {
    return this._internalService.events || null
  };

  get meetingCalender() :MeetingCalenderFormModel  {
    return this._internalService.meetingCalender || null;
  }

  constructor(
    private datePipe: DatePipe,
    private _internalService: Service,
  ) {
    const today = this.datePipe.transform(new Date(), 'yyyy-mm-dd');
    this._internalService.setMeetingDateRange(today, today);
    this._internalService.getActiveMeeting()
  }

  onCalendarDateChange(date: Date) {
    let selectedDate = this.datePipe.transform(date, 'yyyy-mm-dd');
    this._internalService.setMeetingDateRange(selectedDate, selectedDate);
    this._internalService.getActiveMeeting()
  }

}
