import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeAttendanceRoutingModule } from './time-attendance-routing.module';
import { TimeAttendanceListComponent } from './pages/time-attendance-list/time-attendance-list.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [TimeAttendanceListComponent],
  imports: [CommonModule, SharedModule, TimeAttendanceRoutingModule],
})
export class TimeAttendanceModule {}
