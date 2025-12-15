import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowDesignRoutingModule } from './workflow-design-routing.module';
import { WorkflowDesignComponent } from './pages/workflow-design/workflow-design.component';
import { SharedModule } from '@shared/shared.module';
import { ActionsListComponent } from './pages/actions/actions-list/actions-list.component';
import { AddActionComponent } from './pages/actions/add-action/add-action.component';
import { AddClassificationComponent } from './pages/classifications/add-classification/add-classification.component';
import { AddStepCategoryComponent } from './pages/step-categories/add-step-category/add-step-category.component';
import { StepCategoriesListPage } from './pages/step-categories/step-categories-list/step-categories-list.component';
import { AddStepComponent } from './pages/steps/add-step/add-step.component';
import { StepsListComponent } from './pages/steps/steps-list/steps-list.component';
import { ClassificationsListComponent } from './pages/classifications/classifications-list/classifications-list.component';
import { DocumentTypesListComponent } from './pages/document-types/document-types-list/document-types-list.component';
import { AddDocumentTypeComponent } from './pages/document-types/add-document-type/add-document-type.component';

@NgModule({
  declarations: [
    WorkflowDesignComponent,
    ActionsListComponent,
    AddClassificationComponent,
    StepCategoriesListPage,
    AddStepCategoryComponent,
    StepsListComponent,
    AddStepComponent,
    ClassificationsListComponent,
    AddActionComponent,
    DocumentTypesListComponent,
    AddDocumentTypeComponent,
  ],
  imports: [CommonModule, SharedModule, WorkflowDesignRoutingModule],
})
export class WorkflowDesignModule {}
