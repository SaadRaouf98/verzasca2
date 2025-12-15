import { Injectable } from '@angular/core';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageSecretarialsService {
  constructor(
    public organizationUnitsService: OrganizationUnitsService,
    public usersService: UsersService
  ) {}
}
