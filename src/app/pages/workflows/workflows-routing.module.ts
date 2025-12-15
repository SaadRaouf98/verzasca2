import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWorkflowTreatmentComponent } from './pages/workflow-treatments/add-workflow-treatment/add-workflow-treatment.component';
import { WorkflowTreatmentsListComponent } from './pages/workflow-treatments/workflow-treatments-list/workflow-treatments-list.component';
import { WorkflowEngineComponent } from './pages/workflow-engine/workflow-engine.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: WorkflowTreatmentsListComponent,
  },
  {
    path: 'add',
    component: AddWorkflowTreatmentComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateSchemas,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/edit',
    component: AddWorkflowTreatmentComponent,
  },
  {
    path: ':id/workflow-engine',
    component: WorkflowEngineComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ModifyWorkflow,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowsRoutingModule {}
