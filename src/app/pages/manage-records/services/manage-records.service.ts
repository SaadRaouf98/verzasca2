import { Injectable } from '@angular/core';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { RecordsService } from '@core/services/backend-services/records.service';

@Injectable({
  providedIn: 'root',
})
export class ManageRecordsService {
  constructor(
    public recordsService: RecordsService,
    public organizationUnitsService: OrganizationUnitsService,
    public prioritiesService: PrioritiesService,
    public classificationsService: ClassificationsService,
    public notificationsHubService: NotificationsHubService
  ) {}
}
