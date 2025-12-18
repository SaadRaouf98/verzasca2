
export interface MeetingCalenderFormModel {
  meetingDateTime: DateFromTo,
}

export interface DateFromTo {
  from?: string,
  to?: string,
  date?: string,
}

export interface EventItem {
  title: string;
  startTime: string; // e.g. "05:00"
  endTime: string; // e.g. "07:00"
  date: Date;
  meetingDateTime: Date;
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
