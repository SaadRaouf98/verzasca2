import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowDesignComponent } from './pages/workflow-design/workflow-design.component';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ActionsListComponent } from './pages/actions/actions-list/actions-list.component';
import { AddActionComponent } from './pages/actions/add-action/add-action.component';
import { AddClassificationComponent } from './pages/classifications/add-classification/add-classification.component';
import { ClassificationsListComponent } from './pages/classifications/classifications-list/classifications-list.component';
import { AddStepCategoryComponent } from './pages/step-categories/add-step-category/add-step-category.component';
import { StepCategoriesListPage } from './pages/step-categories/step-categories-list/step-categories-list.component';
import { AddStepComponent } from './pages/steps/add-step/add-step.component';
import { StepsListComponent } from './pages/steps/steps-list/steps-list.component';
import { DocumentTypesListComponent } from './pages/document-types/document-types-list/document-types-list.component';
import { AddDocumentTypeComponent } from './pages/document-types/add-document-type/add-document-type.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowDesignComponent,
  },
  {
    path: 'actions',
    component: ActionsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewActions,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'actions/add',
    component: AddActionComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateAction,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'actions/:id/edit',
    component: AddActionComponent,
  },
  {
    path: 'classifications',
    component: ClassificationsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewClassifications,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'classifications/add',
    component: AddClassificationComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateClassification,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'classifications/:id/edit',
    component: AddClassificationComponent,
  },
  //////////////////////////////////////

  {
    path: 'step-categories',
    component: StepCategoriesListPage,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewStepCategories,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'step-categories/add',
    component: AddStepCategoryComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateStepCategory,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'step-categories/:id/edit',
    component: AddStepCategoryComponent,
  },
  //////////////////////////////////////

  {
    path: 'steps',
    component: StepsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewSteps,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'steps/add',
    component: AddStepComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateStep,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'steps/:id/edit',
    component: AddStepComponent,
  },

  //////////////////////////////////////

  {
    path: 'document-types',
    component: DocumentTypesListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewDocumentTypes,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'document-types/add',
    component: AddDocumentTypeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateDocumentType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'document-types/:id/edit',
    component: AddDocumentTypeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowDesignRoutingModule {}
