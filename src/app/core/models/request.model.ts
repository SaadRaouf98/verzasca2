import { ActionType } from '@core/enums/action-type.enum';
import { ApprovedAmountMechanism } from '@core/enums/approved-amount-mechanism.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { RequestStatus } from '@core/enums/request-status.enum';
import { RequestAttachment } from './request-attachment.model';
import { RecordType } from '@core/enums/record-type.enum';
import { NoteType } from '@core/enums/note-type.enum';
import { LetterType } from '@core/enums/letter-type.enum';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';

export interface Request {
  checked?: boolean;
  id: string;
  autoNumber: number;
  number: number;
  importNumber: number;

  title: string;
  description: string;
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

  sector: {
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
  isExported?: boolean;
  status: RequestStatus;
  mainConsultant: {
    id: string;
    name: string;
  } | null;

  consultants: {
    id: string;
    name: string;
    isMain: boolean;
  }[];

  documentType: ExportedDocumentType;
  otherDocumentType: {
    id: string;
    title: string;
  };
  isRestricted: boolean;
  nextStep?: {
    id: string;
    title: string;
    titleEn: string;
  };
  transactionNumber: string;
  committeeId: string | null;
  deliveryNumber: string | null;
  isArchived: boolean;
  date: string;
  createdOn: string;
}

// Shared reusable types
export interface LookupItem {
  id: string;
  title: string;
  titleEn: string;
}

export interface Consultant {
  id: string;
  name: string;
  isMain: boolean;
}

export interface RequestItem {
  /** Whether the request is selected in UI */
  checked?: boolean;

  /** Unique identifier for the request */
  id: string;

  /** Auto-generated number */
  autoNumber: number;

  /** Import tracking number */
  importNumber: number;

  /** Export tracking number */
  exportNumber: number;

  /** Title of the request */
  title: string;

  /** Detailed description */
  description: string;

  /** Priority information */
  priority: LookupItem;

  /** Foundation information */
  foundation: LookupItem;

  /** Sector information */
  sector: LookupItem;

  /** Type of request */
  requestType: LookupItem;

  /** Status of the request */
  status: RequestStatus;

  /** Main consultant handling this request */
  mainConsultant?: {
    id: string;
    name: string;
  } | null;

  /** List of all consultants assigned to the request */
  consultants: Consultant[];

  /** Indicates if the request contains restricted content */
  isRestricted: boolean;

  /** The next step in the request workflow, if any */
  nextStep?: LookupItem;

  /** System-generated transaction number */
  transactionNumber: string;

  /** Date of request creation or update (ISO format recommended) */
  date: string;
}

export interface RequestContainer {
  id: string;
  title: string;
  autoNumber: number;
  transactionNumber: number;
  year: number;
}

export interface ExportRequestModel {
  id: string;
  title: string;
  exportNumber: number;
  priority: LookupItem;
  classification: LookupItem;
  isInitiated: boolean;
  isSigned: boolean;
  isExported: boolean;
  isRestricted: boolean;
  requestContainer: RequestContainer;
  date: string; // ISO date string or Date
  year: number;
  autoNumber: number;
  transactionNumber: string;
  physicalNumber: string;
  physicalDate: string;
  exportedDate: string;
  documentType: ExportedDocumentType;
  committeeId: string;
  foundations: LookupItem[];
  request: LookupItem;
}

// export interface RequestItem {
//   checked?: boolean;
//   id: string;
//   autoNumber: number;
//   importNumber: number;
//   exportNumber: number;
//
//   title: string;
//   description: string;
//   priority: {
//     id: string;
//     title: string;
//     titleEn: string;
//   };
//
//   foundation: {
//     id: string;
//     title: string;
//     titleEn: string;
//   };
//   sector: {
//     id: string;
//     title: string;
//     titleEn: string;
//   };
//
//   requestType: {
//     id: string;
//     title: string;
//     titleEn: string;
//   };
//   status: RequestStatus;
//   mainConsultant: {
//     id: string;
//     name: string;
//   } | null;
//
//   consultants: {
//     id: string;
//     name: string;
//     isMain: boolean;
//   }[];
//
//   isRestricted: boolean;
//   nextStep?: {
//     id: string;
//     title: string;
//     titleEn: string;
//   };
//   transactionNumber: string;
//   date: string;
// }

export interface RequestDetails {
  id: string;
  title: string;
  description: string;
  transactionNumber?: any;
  autoNumber: number;
  importNumber: number;
  physicalDate: string;
  deliveryDate: string;
  allowAssign: boolean;
  assignedUser: any;
  exportNumber: number;
  availabilityDate: string;
  consultants?: RequestConsultantDto[] | null;
  physicalNumber: string;
  deliveryNumber: string;
  code: string;
  note: string;
  requestId?: string;
  number?: number;
  escalationDuration: number;
  creditsRequestedAmount: number;
  creditsApprovedAmount: number;
  costsRequestedAmount: number;
  costsApprovedAmount: number;
  isExported: boolean;
  isExportDocument?: boolean;
  status: RequestStatus;
  exportDocumentId: string;
  consultant: {
    id: string;
    name: string;
  };
  priority: {
    id: string;
    title: string;
    titleEn: string;
  };

  requestContainer: {
    id: string;
    title: string;
    transactionNumber?: any;
  };
  requestType: {
    id: string;
    title: string;
    titleEn: string;
  };
  classification: {
    id: string;
    title: string;
    titleEn: string;
  };

  foundation: {
    id: string;
    title: string;
    titleEn: string;
  };

  subFoundation: {
    id: string;
    title: string;
    titleEn: string;
  } | null;
  container?: concernedFoundations;
  concernedFoundations: {
    id: string;
    title: string;
    titleEn: string;
  }[];

  actions: Action[];
  attachments: Attachment[];
  hasExportRecommendation: boolean;
  isTransaction: boolean;
  isRestricted: boolean;
  editorFileId: string;
  currentProgress: RequestProgressType;
  extendDays: number;
  studyingFile: Attachment | null;
  committee: {
    id: string;
    title: string;
    titleEn: string;
    committeeSymbol: string;
  };
  isCommitteeApprovalStep: boolean;
  currentExport: RequestCurrentExport | null;
  attachmentDescription: string;
  users: any[];
}

export interface concernedFoundations {
  concernedFoundations: {
    id: string;
    title: string;
    titleEn: string;
  };
}
export interface RequestCurrentExport {
  id: string;
  name: string;
  type: ExportedDocumentType;
  foundations: { id: string; title: string }[];
}

export interface Action {
  id: string;
  title: string;
  description: string;
  titleEn: string;
  descriptionEn: string;
  actionType: ActionType;
  formType: number; //This property could be removed later
}

export interface Attachment {
  contentType: string; //.docx
  id: string;
  name: string;
  path: string;
}

export interface AllRequests {
  data: Request[];
  totalCount: number;
  groupCount: number;
}

export interface AllExportRequestModel {
  data: ExportRequestModel[];
  totalCount: number;
  groupCount: number;
}

export interface AllImportRequests {
  data: RequestItem[];
  totalCount: number;
  groupCount: number;
}

export interface AllAllowedUsers {
  data: User[];
  totalCount: number;
  groupCount: number;
}

export interface AddRequestCommand {
  title: string;
  description: string;
  physicalDate: string;
  deliveryDate: string;
  availabilityDate: string;
  physicalNumber: string;
  deliveryNumber: string;
  note: string;
  priorityId: string;
  requestContainerId: string;
  requestTypeId: string;
  creditsRequestedAmount: number;
  creditsApprovedAmount: number;
  costsRequestedAmount: number;
  costsApprovedAmount: number;
  classificationId: string;
  foundationId: string;
  subFoundationId: string | null;
  concernedFoundationsIds: string[];
  committeeId: string;
  attachmentDescription: string;
  usersIds: string[];
  attachmentIds: string[];
  //committeeId: string;
}

export interface UpdateRequestCommand {
  title: string;
  description: string;
  physicalDate: string;
  deliveryDate?: string;
  availabilityDate: string;
  physicalNumber: string;
  deliveryNumber: string;
  note: string;
  attachmentsIds: string[];
  priorityId: string;
  creditsRequestedAmount: number;
  creditsApprovedAmount: number;
  costsRequestedAmount: number;
  costsApprovedAmount: number;
  requestContainerId: string | null;
  foundationId: string;
  subFoundationId: string | null;
  concernedFoundationsIds: string[];
  committeeId: string;
  attachmentDescription: string;
  usersIds: string[];
  classificationId: string;
}

export interface UpdateRequestAttachmentsCommand {
  attachments: RequestAttachment[];
}

export interface AllRelatedRequests {
  data: RelatedRequest[];
  totalCount: number;
  groupCount: number;
}

export interface RelatedRequest {
  id: string;
  title: string;
  description: string;
  importNumber: number;
  deliveryDate: string;
  transactionNumber?: string;
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
  mainConsultant: {
    id: string;
    name: string;
  };
  isExported: boolean;
  status: RequestStatus;
}

export interface RelatedRequestScrollableTable {
  id: string;
  importNumber: number;
  title: string;
  transactionNumber?: string;
  priority: {
    id: string;
    title: string;
    titleEn: string;
    colorCode?: string;
  };
  status: RequestStatus;
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

  consultant: {
    id: string;
    name: string;
  };
  subFoundation?: {
    id: string;
    title: string;
    titleEn: string;
  } | null;

  concernedFoundations?: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  sector?: { id: string; title: string; titleEn: string } | null;
}

export interface AddRelatedRequestsCommand {
  relatedRequestIds: string[];
}

export interface RequestTimeLine {
  title: string;
  date: string;
}

export interface RequestExportRecommendation {
  exportNumber: number;
  exportType: ExportedDocumentType;
  recordType: RecordType | null;
  noteType: NoteType | null;
  letterType: LetterType | null;

  otherNoteType: string;
  recommendationType: {
    id: string;
    title: string;
    titleEn: string;
  };
  extendDays: string;
  recommendationTypeComment: string | null;
  committee: {
    id: string;
    title: string;
    titleEn: string;
    committeeSymbol: string;
  };
  processTypeJustifications: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  committeeChangeReason: string | null;
  outcome: {
    id: string;
    title: string;
    titleEn: string;
  } | null;
  comment: string | null;
  recommendation: Attachment;
  attachments: Attachment[] | null;
  costsAmountMechanism: ApprovedAmountMechanism;
  creditsAmountMechanism: ApprovedAmountMechanism;
}

export interface CommitteeApproval {
  id: string;
  name: string;
  action: {
    comment: string;
    approval: MemberApprovalType | null;
    date: string;
  } | null;
}

export interface CommitteeApprovalRealTime {
  requestId: string;
  memberId: string;
  comment: string | null;
  approval: MemberApprovalType | null;
  date: string;
}
export interface RequestAssigningReceiverRealTime {
  requestId: string;
  user: User | null;
}

export interface SignaturesSections {
  items: SignatureItem[];
}

interface SignatureItem {
  title: string;
  user: {
    id: string;
    name: string;
  };
  size: number;
  action: {
    id: string;
    type: 1;
    date: string;
    signatureImage: string;
    comment: string;
  };
}

export interface User {
  id?: string;
  name?: string;
  hasAccess?: boolean;
}

export interface RequestsFiltersForm {
  searchKeyword?: string;
  searchText?: string;
  title?: string;
  searchFilterQuery?: string[][] | undefined;
  foundation?: { id: string; title: string };
  requestType?: { id: string; title: string };
  documentType?: ExportedDocumentType;
  priority?: { id: string; title: string };
  priorityId?: string;
  consultant?: { id: string; name: string };
  status?: { id: string; name: string };
  committee?: { id: string; committeeSymbol?: string };
  fromDate?: string;
  foundationId?: string;
  toDate?: string;
  hijriFromDate?: string;
  requestTypeId?: string;
  hijriToDate?: string;
  consultantId?: string;
  isExportDocument?: boolean | null;
  physicalNumber?: string;
  requestContainer?: { id: string; title: string };
  exportType?: { id: string; title: string };
  sector?: { id: string; title: string };
}

export interface RequestStep {
  checked?: boolean;
  id: string;
  title: string;
  action: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
  };
}

export interface RequestAttachmentImageCommand {
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
    page: number;
  };
  image: string;
}

export interface RelatedRequestResultDto {
  id: string;
  title?: string | null;
  description?: string | null;
  transactionNumber?: string | null;
  deliveryNumber?: string | null;
  physicalNumber?: string | null;
  committeeSymbol?: string | null;
  autoNumber: number;
  importNumber: number;
  isRestricted: boolean;
  isExported: boolean;
  deliveryDate?: string | null; // ISO date-time string
  availabilityDate?: string | null; // ISO date-time string
  status: RequestStatus; // Using existing enum (values 1-12)
  requestContainer?: RelatedRequestContainerResultDto | null;
  priority: PriorityLookupResultDto;
  baseRequestType: MultilingualItemTitleDto;
  foundation: MultilingualItemTitleDto;
  subFoundation?: MultilingualItemTitleDto | null;
  concernedFoundations?: MultilingualItemTitleDto[] | null;
  requestType: MultilingualItemTitleDto;
  consultants?: RequestConsultantDto[] | null;
  mainConsultant?: ElementDto | null;
  nextStep?: MultilingualItemTitleDto | null;
  classification?: ClassificationLevelDto | null;
}

export interface RelatedRequestContainerResultDto {
  id: string;
  title?: string | null;
  description?: string | null;
  autoNumber?: number | null;
  transactionNumber?: number | null;
  containerStatus: RequestContainerStatus; // Using existing enum (values 1-6)
  priority: PriorityLookupResultDto;
  sector?: MultilingualItemTitleDto | null;
  foundation: MultilingualItemTitleDto;
  concernedFoundations?: MultilingualItemTitleDto[] | null;
  subFoundation?: MultilingualItemTitleDto | null;
}

export interface PriorityLookupResultDto {
  readonly id: string;
  readonly title?: string | null;
  readonly titleEn?: string | null;
  readonly colorCode?: string | null;
}

export interface MultilingualItemTitleDto {
  id: string;
  title?: string | null;
  titleEn?: string | null;
}

export interface RequestConsultantDto {
  id: string;
  name?: string | null;
  isMain: boolean;
}

export interface ElementDto {
  id: string;
  name?: string | null;
}

export interface ClassificationLevelDto {
  id: string;
  title?: string | null;
  level: 1 | 2; // Enum with 2 values
}
