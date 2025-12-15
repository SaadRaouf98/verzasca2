import { Injectable } from '@angular/core';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { TimeAttendancesService } from '@core/services/backend-services/time-attendances.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageUsersService {
  constructor(
    public usersService: UsersService,
    public timeAttendancesService: TimeAttendancesService,
    public organizationUnitsService: OrganizationUnitsService
  ) {}
}
