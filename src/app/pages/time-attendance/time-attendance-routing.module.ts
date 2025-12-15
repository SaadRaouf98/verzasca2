import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeAttendanceListComponent } from './pages/time-attendance-list/time-attendance-list.component';

const routes: Routes = [
  {
    path: '',
    component: TimeAttendanceListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimeAttendanceRoutingModule {}
