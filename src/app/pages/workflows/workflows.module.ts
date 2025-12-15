import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { WorkflowTreatmentsListComponent } from './pages/workflow-treatments/workflow-treatments-list/workflow-treatments-list.component';
import { AddWorkflowTreatmentComponent } from './pages/workflow-treatments/add-workflow-treatment/add-workflow-treatment.component';
import { SharedModule } from '@shared/shared.module';
import { WorkflowEngineComponent } from './pages/workflow-engine/workflow-engine.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SelectActionsModalComponent } from './components/select-actions-modal/select-actions-modal.component';
import { EditDeleteLinkModalComponent } from './components/edit-delete-link-modal/edit-delete-link-modal.component';

@NgModule({
  declarations: [
    WorkflowTreatmentsListComponent,
    AddWorkflowTreatmentComponent,
    WorkflowEngineComponent,
    SelectActionsModalComponent,
    EditDeleteLinkModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxGraphModule,
    MatSidenavModule,
    WorkflowsRoutingModule,
  ],
})
export class WorkflowsModule {}
