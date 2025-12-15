import { SharedModule } from '@shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageMeetingsRoutingModule } from './manage-meetings-routing.module';
import { ManageMeetingsListComponent } from './pages/manage-meetings-list/manage-meetings-list.component';
import { AddMeetingComponent } from './pages/add-meeting/add-meeting.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { AttendanceScrollableTableComponent } from './components/attendance-scrollable-table/attendance-scrollable-table.component';
import { ManageMeetingsFiltersModalComponent } from './components/manage-meetings-filters-modal/manage-meetings-filters-modal.component';
import { ScheduledRequestContainersScrollableTableComponent } from './components/scheduled-request-containers-scrollable-table/scheduled-request-containers-scrollable-table.component';
import { MeetingDetailsComponent } from './pages/meeting-details/meeting-details.component';
import { ConfirmMeetingAttendanceComponent } from './pages/confirm-meeting-attendance/confirm-meeting-attendance.component';
import { AttendMeetingMembersComponent } from './pages/attend-meeting-members/attend-meeting-members.component';
import { MeetingsFiltersComponent } from './components/meetings-filters/meetings-filters.component';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';
import { TransactionNumberPipe } from '../../shared/pipes/transaction-number.pipe';

@NgModule({
  declarations: [
    ManageMeetingsListComponent,
    AddMeetingComponent,
    ManageMeetingsFiltersModalComponent,
    AttendanceScrollableTableComponent,
    ScheduledRequestContainersScrollableTableComponent,
    MeetingDetailsComponent,
    ConfirmMeetingAttendanceComponent,
    AttendMeetingMembersComponent,
    MeetingsFiltersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    ManageMeetingsRoutingModule,
    RangeGregorianCalendarComponent,
    RangeHijriCalendarComponent,
    TransactionNumberPipe,
  ],
})
export class ManageMeetingsModule {}
