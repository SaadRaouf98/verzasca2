import { MeetingType } from '@core/enums/meeting-type.enum';
import { User } from './user.model';
import { MeetingStatus } from '@core/enums/meeting-status.enum';

export interface Meeting {
  id: string;
  committee: {
    id: string;
    title: string;
    titleEn: string;
  };
  title: string;
  containersCount: number;
  memberCount: number;
  meetingType: MeetingType;
  isVirtual: boolean;
  attendanceCount: number;
  durationInMinutes: number;
  meetingDateTime: string;
  status: MeetingStatus;
}

export interface MeetingDetails {
  id: string;
  title: string;
  description: string;
  meetingType: MeetingType;
  meetingDateTime: string;
  status: MeetingStatus;
  isVirtual: boolean;
  attendances: { name: string; email: string; foundation: string }[];
  durationInMinutes: number;
  discussionPoints: string[];
  url: string;
  password: string;

  committee: { id: string; title: string; titleEn: string };
  requestContainers: ScheduledRequestContainer[];
  scheduledRequestContainers: ScheduledRequestContainer[];
  members: MemberStatus[];
  committeeMembers: {
    id: string;
    isAttended: boolean;
    isOnVacation: boolean;
    name: string;
  }[];
}

export interface AllMeetings {
  data: Meeting[];
  totalCount: number;
  groupCount: number;
}

export interface MeetingFilter {
  id: string;
  name: string;
  displayedText: string;
  fromDate?: string;
  toDate?: string;
}

export interface MeetingCommand {
  id?: string;
  meetingType: MeetingType;
  title: string;
  meetingDateTime: string;
  isVirtual: true;
  description: string;
  attendances: [
    {
      name: string;
      email: string;
      foundation: string;
    }
  ];
  durationInMinutes: number;
  url: string;
  password: string;
  discussionPoints: [string];
  committeeId: string;
  requestContainers: string[];
  scheduledRequestContainers: string[];
  members: string[];
}

export interface CloseMeetingCommand {
  meetingId: string;
  members: {
    memberId: string;
    isAttended: boolean;
  }[];

  discussedContainersIds: string[];
}

export interface ConfirmMeetingAttendanceCommand {
  meetingId: string;
  members: {
    memberId: string;
    isAttended: boolean;
    isOnVacation: boolean;
  }[];

  discussedContainersIds: string[];
}

export interface MeetingAttendant {
  id: number;
  name: string;
  email: string;
  foundation?: string;
}

export interface MeetinForm {
  id: string;
  title: string;
  description: string;
  url: string;
  password: string;
  isVirtual: boolean;
  meetingDateTime: string;
  durationInMinutes: number;
  meetingType: MeetingType;
  committee: {
    id: string;
    title: string;
    titleEn: string;
  };
  user: User | undefined;
  members: {
    id: string;
    name: string;
  }[];

  attendances: MeetingAttendant[];

  requestContainersIds: string[];
  scheduledRequestContainersIds: string[];
  discussionPoints: string[];
}

//////////////////////////////////////////////////////////////////////////////////

export interface AllScheduledRequestContainers {
  data: ScheduledRequestContainer[];
  totalCount: number;
  groupCount: number;
}

export interface ScheduledRequestContainer {
  isDiscussed?: boolean;
  id: string;
  title: string;
  transactionNumber: string;
}

export interface MemberStatus {
  isAttended?: boolean;
  isOnVacation?: boolean;
  id: string;
  name: string;
}

////////////////////////// Calendar ///////////////////////////////////
export interface CalendarDayEvents {
  date: string;
  meetings: Meeting[];
}
////////////////////////////////////////////////////////////////
export interface MeetingsFilterForm {
  searchKeyword?: string;
  fromDate?: string;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
}
