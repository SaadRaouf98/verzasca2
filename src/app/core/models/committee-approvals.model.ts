import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';

export interface CommitteeApprovals {
  id: string;
  title: string;
  totalRecords: number;
  members: {
    id: string;
    name: string;
    actions: [
      {
        type: ExportableDocumentActionType;
        count: number;
      }
    ];
    totalActions: number;
    averageActionsMinutes: number;
  }[];
  actions: {
    type: ExportableDocumentActionType;
    count: number;
  }[];
}
