import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { RequestStatus } from '@core/enums/request-status.enum';

export interface AllPendingRequests {
  data: PendingRequest[];
  totalCount: number;
  groupCount: number;
}

export interface PendingRequest {
  id: string;
  autoNumber: number;
  importNumber: number;

  title: string;
  deliveryDate: string;
  priority: {
    id: string;
    title: string;
    titleEn: string;
  };

  foundation: {
    id: string;
    title: string;
    titleEn: string;
  };

  requestType: {
    id: string;
    title: string;
    titleEn: string;
  };

  isExportDocument: boolean;
  consultant: {
    id: string;
    name: string;
  } | null;

  exportType?: ExportedDocumentType;
  nextStep?: {
    id: string;
    title: string;
    titleEn: string;
  };
  isHolding: boolean;
}

export interface PendingRequestsFiltersForm {
  searchKeyword?: string;
  foundationId?: string;
  requestTypeId?: string;
  priorityId?: string;
  nextStepTitle?: string;
  consultantId?: string;
  exportTypeId?: string;
  fromDate?: string;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
  statusId?: number;
  isExportDocument?: boolean | null;
  reset?: boolean;
}
