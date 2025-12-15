import { DayOfWeek } from '@core/enums/day-of-week.enum';

export interface TimeAttendant {
  id: string;
  dateTime: string;
  dayOfWeek: DayOfWeek;
  inTime: string;
  outTime: string;
  normalRegular: string;
  normalOverTime: string;
  totalWorkTime: string;
}

export interface AllTimeAttendance {
  records: TimeAttendant[];
  total: number;
  hasFingerPrint: boolean;
}

export interface TimeAttendanceSummary {
  department: string;
  normalRegular: string;
  normalOvertime: string;
  totalWorkTime: string;
  absence: string;
  insufficientWorkTime: string;
  lateIn: string;
  earlyOut: string;
  missingEventType: string;
  missingPunchIn: string;
  missingPunchOut: string;
  punchBreak: string;
  overBreak: string;
  mealTime: string;
  regularByTimeRate: string;
  overtimeByTimeRate: string;
  totalHours: number;
}
