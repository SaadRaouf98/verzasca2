import { Injectable } from '@angular/core';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { MeetingsService } from '@core/services/backend-services/meetings.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageMeetingsService {
  constructor(
    public meetingsService: MeetingsService,
    public organizationUnitsService: OrganizationUnitsService,
    public usersService: UsersService
  ) {}
}
