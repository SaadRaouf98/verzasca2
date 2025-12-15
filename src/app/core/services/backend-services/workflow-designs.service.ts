import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  AddNodeCommand,
  BridgeTwoNodesCommand,
  UpdateNodeCommand,
  Workflow,
} from '@core/models/workflow/workflow-model';
import { ActionType } from '@core/enums/action-type.enum';
import { Link } from '@core/models/workflow/link.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowDesignsService {
  readonly apiUrl = '/api/v1/workflowdesigns';

  constructor(private apiService: ApiService) {}

  getWorkflowById(id: string): Observable<Workflow> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  createNode(
    schemaId: string,
    data: AddNodeCommand
  ): Observable<{
    schemaStepId: string;
    actions: {
      id: string;
      title: string;
      titleEn: string;
      schemaStepActionId: string;
      isSelected: boolean;
      actionType: ActionType;
    }[];
  }> {
    return this.apiService.post(`${this.apiUrl}/${schemaId}/steps`, data);
  }

  updateNode(
    schemaId: string,
    data: UpdateNodeCommand
  ): Observable<
    {
      id: string;
      title: string;
      titleEn: string;
      schemaStepActionId: string;
      isSelected: boolean;
      actionType: ActionType;
    }[]
  > {
    return this.apiService.put(`${this.apiUrl}/${schemaId}/steps`, data);
  }

  deleteNode(schemaId: string, schemaStepId: string): Observable<null> {
    return this.apiService.delete(
      `${this.apiUrl}/${schemaId}/steps/${schemaStepId}`
    );
  }

  deleteLink(
    schemaId: string,
    schemaStepActionsId: string[]
  ): Observable<null> {
    let url = `${this.apiUrl}/${schemaId}/actions?`;

    schemaStepActionsId.forEach((ele) => {
      url += `&schemaStepActionsIds=${ele}`;
    });

    return this.apiService.delete(url);
  }

  bridgeTwoNodes(
    schemaId: string,
    data: BridgeTwoNodesCommand
  ): Observable<Link> {
    return this.apiService.post(`${this.apiUrl}/${schemaId}/actions`, data);
  }
}
