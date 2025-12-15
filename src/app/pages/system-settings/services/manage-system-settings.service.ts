import { Injectable } from '@angular/core';
import { ActionsService } from '@core/services/backend-services/actions.service';
import { BenefitTypesService } from '@core/services/backend-services/benefit-types.service';
import { ClassificationsService } from '@core/services/backend-services/classifications.service';
import { CommitteeSequencesService } from '@core/services/backend-services/committee-sequences.service';
import { ConsultantGroupsService } from '@core/services/backend-services/consultant-groups.service';
import { DocumentTypesService } from '@core/services/backend-services/document-types.service';
import { ExportedAttachmentTypesService } from '@core/services/backend-services/exported-attachment-types.service';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { OutcomesService } from '@core/services/backend-services/outcomes.service';
import { PrioritiesService } from '@core/services/backend-services/priorities.service';
import { ProcessTypeJustificationsService } from '@core/services/backend-services/process-type-justifications.service';
import { RecommendationTypesService } from '@core/services/backend-services/recommendation-types.service';
import { ReferralJustificationsService } from '@core/services/backend-services/referral-justifications.service';
import { SchemasService } from '@core/services/backend-services/schemas.service';
import { SectorsService } from '@core/services/backend-services/sectors.service';
import { SignaturesService } from '@core/services/backend-services/signatures.service';
import { StepCategoriesService } from '@core/services/backend-services/step-categories.service';
import { StepsService } from '@core/services/backend-services/steps.service';
import { UsersService } from '@core/services/backend-services/users.service';

@Injectable({
  providedIn: 'root',
})
export class ManageSystemSettingsService {
  constructor(
    public sectorsService: SectorsService,
    public benefitTypesService: BenefitTypesService,
    public foundationsService: FoundationsService,
    public prioritiesService: PrioritiesService,
    public stepCategoriesService: StepCategoriesService,
    public schemasService: SchemasService,
    public actionsService: ActionsService,
    public classificationsService: ClassificationsService,
    public stepsService: StepsService,
    public usersService: UsersService,
    public outcomesService: OutcomesService,
    public recommendationTypesService: RecommendationTypesService,
    public referralJustificationsService: ReferralJustificationsService,
    public signaturesService: SignaturesService,
    public organizationUnitsService: OrganizationUnitsService,
    public committeeSequencesService: CommitteeSequencesService,
    public processTypeJustificationsService: ProcessTypeJustificationsService,
    public consultantGroupsService: ConsultantGroupsService,
    public documentTypesService: DocumentTypesService,
    public exportedAttachmentTypesService: ExportedAttachmentTypesService
  ) {}
}
