import { Injectable } from '@angular/core';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { DeliveryReceiptsService } from '@core/services/backend-services/delivery-receipts.service';
import { DocumentTypesService } from '@core/services/backend-services/document-types.service';
import { ExportableDocumentService } from '@core/services/backend-services/exportable-document.service';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { RequestContainersService } from '@core/services/backend-services/request-containers.service';
import { RequestTypesService } from '@core/services/backend-services/request-types.service';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { UsersService } from '@core/services/backend-services/users.service';
import { WopiFilesService } from '@core/services/backend-services/wopi-files.service';
import { UmAlQuraCalendarService } from '@core/services/backend-services/um-al-qura-calendar.service';
@Injectable({
  providedIn: 'root',
})
export class ManageImportsExportsService {
  constructor(
    public requestsService: RequestsService,
    public requestContainersService: RequestContainersService,
    public exportableDocumentService: ExportableDocumentService,
    public prioritiesService: PrioritiesService,
    public foundationsService: FoundationsService,
    public classificationsService: ClassificationsService,
    public requestTypesService: RequestTypesService,
    public organizationUnitsService: OrganizationUnitsService,
    public usersService: UsersService,
    public deliveryReceiptsService: DeliveryReceiptsService,
    public wopiFilesService: WopiFilesService,
    public documentTypesService: DocumentTypesService,
    public UmAlQuraCalendarService: UmAlQuraCalendarService,
    public notificationsHubService: NotificationsHubService
  ) {}
}
