import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageMeetingsListComponent } from './pages/manage-meetings-list/manage-meetings-list.component';
import { AddMeetingComponent } from './pages/add-meeting/add-meeting.component';
import { MeetingDetailsComponent } from './pages/meeting-details/meeting-details.component';
import { ConfirmMeetingAttendanceComponent } from './pages/confirm-meeting-attendance/confirm-meeting-attendance.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AttendMeetingMembersComponent } from './pages/attend-meeting-members/attend-meeting-members.component';

const routes: Routes = [
  {
    path: '',
    component: ManageMeetingsListComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewMeetings,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'add',
    component: AddMeetingComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateMeeting,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id',
    component: MeetingDetailsComponent,
  },
  {
    path: ':id/confirm',
    component: ConfirmMeetingAttendanceComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ConfirmMeetingAttendance,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/attend',
    component: AttendMeetingMembersComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateMeeting,
        redirectTo: '/home',
      },
    },
  },

  {
    path: ':id/edit',
    component: AddMeetingComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateMeeting,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageMeetingsRoutingModule {}
