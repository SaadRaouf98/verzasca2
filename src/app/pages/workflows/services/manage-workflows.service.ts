import { Injectable } from '@angular/core';
import { ActionsService } from '@core/services/backend-services/actions.service';
import { ActorsService } from '@core/services/backend-services/actors.service';
import { OrganizationUnitsService } from '@core/services/backend-services/organization-units.service';
import { StepsService } from '@core/services/backend-services/steps.service';
import { WorkflowDesignsService } from '@core/services/backend-services/workflow-designs.service';

@Injectable({
  providedIn: 'root',
})
export class ManageWorkflowsService {
  constructor(
    public stepsService: StepsService,
    public actorsService: ActorsService,
    public actionsService: ActionsService,
    public workflowsService: WorkflowDesignsService,
    public organizationUnitsService: OrganizationUnitsService
  ) {}
}
