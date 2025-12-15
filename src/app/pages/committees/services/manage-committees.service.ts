import { Injectable } from '@angular/core';
import { CommitteeSequencesService } from '@core/services/backend-services/committee-sequences.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageCommitteesService {
  constructor(
    public organizationUnitsService: OrganizationUnitsService,
    public usersService: UsersService,
    public committeeSequencesService: CommitteeSequencesService
  ) {}
}
