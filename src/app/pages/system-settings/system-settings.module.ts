import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemSettingsRoutingModule } from './system-settings-routing.module';
import { SystemSettingsPage } from './pages/system-settings/system-settings.component';
import { SharedModule } from '@shared/shared.module';
import { AddBenefitTypePage } from './pages/benefit-types/add-benefit-type/add-benefit-type.component';
import { BenefitTypesListComponent } from './pages/benefit-types/benefit-types-list/benefit-types-list.component';
import { AddFoundationPage } from './pages/foundations/add-foundation/add-foundation.component';
import { FoundationsListComponent } from './pages/foundations/foundations-list/foundations-list.component';
import { AddPriorityPage } from './pages/priorities/add-priority/add-priority.component';
import { PrioritiesListComponent } from './pages/priorities/priorities-list/priorities-list.component';
import { AddSectorPage } from './pages/sectors/add-sector/add-sector.component';
import { SectorsListComponent } from './pages/sectors/sectors-list/sectors-list.component';
import { ContainerOutcomesListComponent } from './pages/container-outcomes/container-outcomes-list/container-outcomes-list.component';
import { AddContainerOutcomeComponent } from './pages/container-outcomes/add-container-outcome/add-container-outcome.component';
import { RecommendationTypesListComponent } from './pages/recommendation-types/recommendation-types-list/recommendation-types-list.component';
import { AddRecommendationTypeComponent } from './pages/recommendation-types/add-recommendation-type/add-recommendation-type.component';
import { AddReferralJustificationComponent } from './pages/referral-justifications/add-referral-justification/add-referral-justification.component';
import { ReferralJustificationsListComponent } from './pages/referral-justifications/referral-justifications-list/referral-justifications-list.component';
import { CommitteesSignaturesListComponent } from './pages/committees-signatures/committees-signatures-list/committees-signatures-list.component';
import { AddCommitteeSignaturesComponent } from './pages/committees-signatures/add-committee-signatures/add-committee-signatures.component';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { TitleModalComponent } from './components/title-modal/title-modal.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CommitteeSequencesListComponent } from './pages/committee-sequences/committee-sequences-list/committee-sequences-list.component';
import { AddCommitteeSequenceComponent } from './pages/committee-sequences/add-committee-sequence/add-committee-sequence.component';
import { ProcessTypeJustificationsListComponent } from './pages/process-type-justifications/process-type-justifications-list/process-type-justifications-list.component';
import { AddProcessTypeJustificationsComponent } from './pages/process-type-justifications/add-process-type-justifications/add-process-type-justifications.component';
import { AddConsultantGroupComponent } from './pages/consultant-groups/add-consultant-group/add-consultant-group.component';
import { ConsultantGroupsListComponent } from './pages/consultant-groups/consultant-groups-list/consultant-groups-list.component';
import { AddExportedAttachmentTypeComponent } from './pages/exported-attachment-types/add-exported-attachment-type/add-exported-attachment-type.component';
import { ExportedAttachmentTypesListComponent } from './pages/exported-attachment-types/exported-attachment-types-list/exported-attachment-types-list.component';

@NgModule({
  declarations: [
    SystemSettingsPage,
    SectorsListComponent,
    BenefitTypesListComponent,
    FoundationsListComponent,
    PrioritiesListComponent,
    AddSectorPage,
    AddBenefitTypePage,
    AddFoundationPage,
    AddPriorityPage,
    ContainerOutcomesListComponent,
    AddContainerOutcomeComponent,
    RecommendationTypesListComponent,
    AddRecommendationTypeComponent,
    ReferralJustificationsListComponent,
    AddReferralJustificationComponent,
    CommitteesSignaturesListComponent,
    AddCommitteeSignaturesComponent,
    TitleModalComponent,
    CommitteeSequencesListComponent,
    AddCommitteeSequenceComponent,
    ProcessTypeJustificationsListComponent,
    AddProcessTypeJustificationsComponent,
    AddConsultantGroupComponent,
    ConsultantGroupsListComponent,
    ExportedAttachmentTypesListComponent,
    AddExportedAttachmentTypeComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    KtdGridModule,
    // NgxPermissionsModule,
    //NgxPermissionsModule.forChild(),

    SystemSettingsRoutingModule,
  ],
})
export class SystemSettingsModule {}
