import { Injectable } from '@angular/core';
import { BenefitTypesService } from '@core/services/backend-services/benefit-types.service';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { SectorsService } from '@core/services/backend-services/sectors.service';
import { StepsService } from '@core/services/backend-services/steps.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManagePendingTransactionsService {
  constructor(
    public requestsService: RequestsService,
    public foundationsService: FoundationsService,
    public sectorsService: SectorsService,
    public benefitTypesService: BenefitTypesService,
    public prioritiesService: PrioritiesService,
    public usersService: UsersService,
    public stepsService: StepsService
  ) {}
}
