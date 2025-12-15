import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemSettingsPage } from './pages/system-settings/system-settings.component';
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
import { AddRecommendationTypeComponent } from './pages/recommendation-types/add-recommendation-type/add-recommendation-type.component';
import { RecommendationTypesListComponent } from './pages/recommendation-types/recommendation-types-list/recommendation-types-list.component';
import { ReferralJustificationsListComponent } from './pages/referral-justifications/referral-justifications-list/referral-justifications-list.component';
import { AddReferralJustificationComponent } from './pages/referral-justifications/add-referral-justification/add-referral-justification.component';
import { CommitteesSignaturesListComponent } from './pages/committees-signatures/committees-signatures-list/committees-signatures-list.component';
import { AddCommitteeSignaturesComponent } from './pages/committees-signatures/add-committee-signatures/add-committee-signatures.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CommitteeSequencesListComponent } from './pages/committee-sequences/committee-sequences-list/committee-sequences-list.component';
import { AddCommitteeSequenceComponent } from './pages/committee-sequences/add-committee-sequence/add-committee-sequence.component';
import { AddProcessTypeJustificationsComponent } from './pages/process-type-justifications/add-process-type-justifications/add-process-type-justifications.component';
import { ProcessTypeJustificationsListComponent } from './pages/process-type-justifications/process-type-justifications-list/process-type-justifications-list.component';
import { ConsultantGroupsListComponent } from './pages/consultant-groups/consultant-groups-list/consultant-groups-list.component';
import { AddConsultantGroupComponent } from './pages/consultant-groups/add-consultant-group/add-consultant-group.component';
import { ExportedAttachmentTypesListComponent } from './pages/exported-attachment-types/exported-attachment-types-list/exported-attachment-types-list.component';
import { AddExportedAttachmentTypeComponent } from './pages/exported-attachment-types/add-exported-attachment-type/add-exported-attachment-type.component';

const routes: Routes = [
  {
    path: '',
    component: SystemSettingsPage,
  },
  ///////////////////////////////////
  {
    path: 'sectors',
    component: SectorsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewSectors,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'sectors/add',
    component: AddSectorPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateSector,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'sectors/:id/edit',
    component: AddSectorPage,
  },
  ///////////////////////////////////////////
  {
    path: 'sectors/:sectorId',
    component: SectorsListComponent,
    canActivate: [NgxPermissionsGuard],

    data: {
      permissions: {
        only: PermissionsObj.ViewSectors,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'sectors/:sectorId/add',
    component: AddSectorPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateSector,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'sectors/:sectorId/:id/edit',
    component: AddSectorPage,
  },

  ///////////////////////////////

  {
    path: 'benefit-types',
    component: BenefitTypesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewBenefitTypes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'benefit-types/add',
    component: AddBenefitTypePage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateBenefitType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'benefit-types/:id/edit',
    component: AddBenefitTypePage,
  },
  /////////////////////////////////////
  {
    path: 'foundations',
    component: FoundationsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewFoundations,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'foundations/add',
    component: AddFoundationPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateFoundation,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'foundations/:id/edit',
    component: AddFoundationPage,
  },
  ///////////////////////////////////////////
  {
    path: 'foundations/:foundationId',
    component: FoundationsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewFoundations,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'foundations/:foundationId/add',
    component: AddFoundationPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateFoundation,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'foundations/:foundationId/:id/edit',
    component: AddFoundationPage,
  },

  ////////////////////////////////////////
  {
    path: 'priorities',
    component: PrioritiesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewPriorities,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'priorities/add',
    component: AddPriorityPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreatePriority,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'priorities/:id/edit',
    component: AddPriorityPage,
  },
  //////////////////////////////////////

  {
    path: 'container-outcomes',
    component: ContainerOutcomesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOutcomes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'container-outcomes/add',
    component: AddContainerOutcomeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateOutcome,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'container-outcomes/:id/edit',
    component: AddContainerOutcomeComponent,
  },
  /////////////////////////////////////
  {
    path: 'recommendation-types',
    component: RecommendationTypesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewRecommendationTypes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'recommendation-types/add',
    component: AddRecommendationTypeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateRecommendationType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'recommendation-types/:id/edit',
    component: AddRecommendationTypeComponent,
  },
  ////////////////////////////////////////
  {
    path: 'referral-justifications',
    component: ReferralJustificationsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewReferralJustifications,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'referral-justifications/add',
    component: AddReferralJustificationComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateReferralJustification,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'referral-justifications/:id/edit',
    component: AddReferralJustificationComponent,
  },
  ////////////////////////////////////////
  {
    path: 'process-type-justifications',
    component: ProcessTypeJustificationsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewProcessTypeJustifications,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'process-type-justifications/add',
    component: AddProcessTypeJustificationsComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateProcessTypeJustification,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'process-type-justifications/:id/edit',
    component: AddProcessTypeJustificationsComponent,
  },
  ////////////////////////////////////////

  {
    path: 'committees-signatures',
    component: CommitteesSignaturesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewSignatureFormats,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'committees-signatures/add',
    component: AddCommitteeSignaturesComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateSignatureFormat,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'committees-signatures/:id/edit',
    component: AddCommitteeSignaturesComponent,
  },

  ////////////////////////////////////////
  {
    path: 'committees-sequences',
    component: CommitteeSequencesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'committees-sequences/add',
    component: AddCommitteeSequenceComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'committees-sequences/:id/edit',
    component: AddCommitteeSequenceComponent,
  },

  ////////////////////////////////////////
  {
    path: 'consultant-groups',
    component: ConsultantGroupsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewConsultantGroups,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'consultant-groups/add',
    component: AddConsultantGroupComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateConsultantGroup,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'consultant-groups/:id/edit',
    component: AddConsultantGroupComponent,
  },

  ////////////////////////////////////////
  {
    path: 'exported-attachment-types',
    component: ExportedAttachmentTypesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewExportedAttachmentType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'exported-attachment-types/add',
    component: AddExportedAttachmentTypeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateExportedAttachmentType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'exported-attachment-types/:id/edit',
    component: AddExportedAttachmentTypeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemSettingsRoutingModule {}
