import { Injectable } from '@angular/core';
import { ActorsService } from '@core/services/backend-services/actors.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { RolesService } from '@core/services/backend-services/roles.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageActorsService {
  constructor(
    public actorsService: ActorsService,
    public rolesService: RolesService,
    public usersService: UsersService,
    public organizationUnitsService: OrganizationUnitsService
  ) {}
}
