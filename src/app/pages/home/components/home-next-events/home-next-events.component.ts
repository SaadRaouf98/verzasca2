// home-next-events.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

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
export class HomeNextEventsComponent implements OnChanges {
  /** incoming raw data grouped by date */
  @Input() meetingGroups: MeetingGroup[] = [];

  /** mapped events exposed to the template */
  events: EventItem[] = [];
  filteredEvents: EventItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['meetingGroups'] && Array.isArray(this.meetingGroups)) {
      this.events = this.meetingGroups.flatMap((group) =>
        group.meetings.map((m) => {
          const start = new Date(m.meetingDateTime);
          const end = new Date(start.getTime() + m.durationInMinutes * 60000);

          const pad = (n: number) => n.toString().padStart(2, '0');
          const hhmm = (d: Date) =>
            `${pad(d.getHours())}:${pad(d.getMinutes())}`;

          return {
            title: m.title,
            startTime: hhmm(start),
            endTime: hhmm(end),
            date: new Date(group.date),
          } as EventItem;
        })
      );
      // By default, show all events
      this.filteredEvents = [...this.events];
    }
  }

  onCalendarDateChange(selection: Date | { begin: Date; end: Date }) {
    let date: Date | undefined;

    if (selection instanceof Date) {
      date = selection;
    } else if (selection && 'begin' in selection && selection.begin) {
      date = selection.begin; // or selection.end, depending on your use case
    }

    if (date) {
      this.filteredEvents = this.events.filter((ev) =>
        this.isSameDay(new Date(ev.date), date!)
      );
    }
  }

  // Helper to compare two dates (ignoring time)
  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
