import { Injectable } from '@angular/core';
import { TimeAttendancesService } from '@core/services/backend-services/time-attendances.service';

@Injectable({
  providedIn: 'root',
})
export class ManageTimeAttendanceService {
  constructor(public timeAttendancesService: TimeAttendancesService) {}
}
