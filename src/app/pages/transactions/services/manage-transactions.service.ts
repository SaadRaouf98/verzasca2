import { Injectable } from '@angular/core';
import { BenefitTypesService } from '@core/services/backend-services/benefit-types.service';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { ExportableDocumentService } from '@core/services/backend-services/exportable-document.service';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { ReferralJustificationsService } from '@core/services/backend-services/referral-justifications.service';
import { RequestContainerAdvancedSearchService } from '@core/services/backend-services/request-container-advanced-search.service';
import { RequestContainersService } from '@core/services/backend-services/request-containers.service';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { SectorsService } from '@core/services/backend-services/sectors.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageTransactionsService {
  constructor(
    public requestContainersService: RequestContainersService,
    public requestsService: RequestsService,
    public foundationsService: FoundationsService,
    public sectorsService: SectorsService,
    public benefitTypesService: BenefitTypesService,
    public prioritiesService: PrioritiesService,
    public classificationsService: ClassificationsService,
    public exportableDocumentService: ExportableDocumentService,
    public organizationUnitsService: OrganizationUnitsService,
    public referralJustificationsService: ReferralJustificationsService,
    public usersService: UsersService,
    public requestContainerAdvancedSearchService: RequestContainerAdvancedSearchService
  ) {}
}
