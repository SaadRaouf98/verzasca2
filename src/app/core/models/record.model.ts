import { ApprovedAmountMechanism } from '@core/enums/approved-amount-mechanism.enum';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { RecordType } from '@core/enums/record-type.enum';
import { environment } from '@env/environment';

export interface Record {
  id: string;
  title: string;
  description: string;
  exportNumber: number;
  committee: {
    id: string;
    title: string;
    committeeSymbol: string;
  };
  classification: {
    id: string;
    title: string;
  };
  priority: {
    id: string;
    title: string;
  };

  isInitiated: boolean;
  isExported: boolean;
  requestContainer: {
    id: string;
    title: string;
    autoNumber: number;
    transactionNumber: number;
    year: number;
  };
  transactionNumber: number;
  isRestricted: boolean;
}

export interface AllRecords {
  data: Record[];
  totalCount: number;
  groupCount: number;
}

export interface TableRecord extends Record {
  isLoadingRowDetails?: boolean;
  viewExpandedElement?: boolean;
  recordMembers?: RecordMember[];
  members?: RecordMember[];
}

export enum CommitteeIds {
  Finance = 'bfb23c24-c443-43c5-b411-aa5140273e06',
  Preparatory = '74dff495-588c-409e-b7c4-dbd31b9ea9a9',
  Coordinating = '5284e50a-ecf2-456d-9483-470beeddb8ea',
}

export interface RecordMember {
  id: string;
  name: string;
  isOnVacation?: boolean;
  action: {
    type: ExportableDocumentActionType | null;
    date: string;
    comment: string | null;
    isPhoneAction: boolean;
  } | null;
}

export interface RecordsFiltersForm {
  searchKeyword: string | undefined;
  committeeIds: string[] | undefined;
  committeeId?: string | undefined;
  priorityId: string | undefined;
  classificationId: string | undefined;
  isInitiated: string | undefined;
  isExported: string | undefined;
}

export interface RecordsFiltersForm2 {
  searchKeyword?: string;
  committeeIds?: string[] | undefined;
  committeeId?: string | undefined;
  priorityId?: string | undefined;
  classificationId?: string | undefined;
  classification?: string | undefined;
  isInitiated?: boolean | null | string;
  isExported?: boolean | null | string;
  priority?: { id: string; title: string };
}

export interface RecordsFilters {
  searchKeyword?: string;
  committee?: { Id?: string[] };
  priority?: { Id?: string };
  classification?: { Id?: string };
  isInitiated?: boolean | null | string;
  isExported?: boolean | null | string;
}

export interface ExportSignature {
  sections: {
    items: {
      size: number;
      image: string;
      user: {
        id: string;
        key: string;
        name: string;
      };

      title: string;
    }[];
  }[];
}

export interface RecordDetails {
  id: string;
  title: string;
  description: string;
  autoNumber: number;
  exportNumber: number;
  creditsRequestedAmount: number;
  creditsApprovedAmount: ApprovedAmountMechanism;
  creditsAmountMechanism: number;
  costsRequestedAmount: number;
  costsApprovedAmount: ApprovedAmountMechanism;
  costsAmountMechanism: number;
  date: string | null;
  exportedDate: string;
  document: {
    id: string;
    name: string;
    path: string;
    contentType: string;
  };

  noteFile?: {
    id: string;
    name: string;
    path: string;
    contentType: string;
  };
  members: RecordDetailedMember[];
  allowPhoneAction: boolean;
  recordType: RecordType;
  isExported: boolean;
  isExtendRequest: boolean;
  approvalDays: number | null;
}

export interface RecordDetailedMember {
  id: string;
  name: string;
  isOnVacation: boolean;
  action: {
    id: string;
    type: ExportableDocumentActionType;
    date: string;
    signatureImage?: string;
    comment: string | null;
    isPhoneAction: boolean;
    commentExpanded: boolean;
  } | null;
}

export interface RecordMembersRealTime {
  recordId: string;
  member: {
    memberId: string;
    actionType: ExportableDocumentActionType | null;
    date: string;
    comment: string | null;
    signatureImage: string | null;
    isPhoneAction: boolean;
  };
}
