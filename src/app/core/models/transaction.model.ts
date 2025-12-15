import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';

export interface Transaction {
  id: string;
  autoNumber: number;
  referralJustification?: any;
  transactionNumber: number;
  containerStatus: RequestContainerStatus;
  title: string;
  description: string;
  descriptionEn: string;
  creditsRequestedAmount: number;
  creditsApprovedAmount: number;
  costsRequestedAmount: number;
  costsApprovedAmount: number;
  request?: any;
  status: Number;
  duration: {
    // مدة الصلاحية
    days: string;
    hours: string;
    minutes: string;
    color: string;
    progress: number;
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

  concernedFoundations: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  benefitType: {
    id: string;
    title: string;
    titleEn: string;
  };
  sector: {
    id: string;
    title: string;
    titleEn: string;
  };
  subSector: {
    id: string;
    title: string;
    titleEn: string;
  };

  priority: {
    id: string;
    title: string;
    titleEn: string;
  };

  classification: {
    id: string;
    title: string;
    titleEn: string;
    classificationLevel: ClassificationLevel;
  };

  users: {
    id: string;
    name: string;
  }[];
  isRestricted: boolean;
  createdOn: string;
  isExtendRequest: boolean;
  nextStep?: {
    id: string;
    title: string;
    titleEn: string;
  };
  year: number;
  committee?: {
    id: string;
    title: string;
    titleEn: string;
  };
  show?: boolean;
  position?: {
    top: string;
    left: string;
  };
}

export interface SearchedTransaction extends Transaction {
  checked?: boolean;
}
export interface AllTransactions {
  data: Transaction[];
  totalCount: number;
  groupCount: number;
}

export interface UpdateTransactionCommand {
  id: string;
  title: string;
  description: string;
  descriptionEn: string;
  foundationId: string;
  subFoundationId: string | null;
  concernedFoundationsIds: string[];
  benefitTypeId?: string;
  sectorId: string;
  priorityId: string;
  classificationId: string;
  referralJustificationId?: string;
  usersIds: string[];
  committeeId?: string;
}

export interface AddTransactionCommand {
  usersIds: string[];
  title: string;
  description: string;
  descriptionEn: string;
  foundationId: string;
  subFoundationId: string | null;
  concernedFoundationsIds: string[];
  benefitTypeId?: string;
  sectorId: string;
  priorityId: string;
  classificationId: string;
  referralJustificationId?: string;
}

export interface TransactionForm {
  id: string;
  autoNumber: number;
  transactionNumber: number;
  title: string;
  description: string;
  descriptionEn: string;
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

  concernedFoundations: {
    id: string;
    title: string;
    titleEn: string;
  }[];

  benefitType: {
    id: string;
    title: string;
    titleEn: string;
  };
  sector: {
    id: string;
    title: string;
    titleEn: string;
  };
  subSector: {
    id: string;
    title: string;
    titleEn: string;
  };

  priorityId: string;
  classificationId: string;
  committeeId: string;
  users?: {
    id: string;
    name: string;
  }[];
  year?: number;
}
export interface UpdateTransactionAmountsCommand {
  id: string; //this is the transaction id
  creditsRequestedAmount: number;
  creditsApprovedAmount: number;
  costsRequestedAmount: number;
  costsApprovedAmount: number;
}
export interface TransactionFilter {
  id: string;
  name: string;
  displayedText: string;
  fromDate?: string;
  toDate?: string;
}
////////////////////////////////////////////////////
export interface AllRelatedContainers {
  data: RelatedContainer[];
  totalCount: number;
  groupCount: number;
}

export interface RelatedContainer {
  id: string;
  transactionNumber: number;
  year: number;
  title: string;
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

  containerStatus: RequestContainerStatus;
}

export interface RequestContainerTimeLine {
  title: string;
  date: string;
}

export interface RequestContainersFiltersForm {
  searchKeyword?: string;
  foundationId?: string;
  sectorId?: string;
  priorityId?: string;
  fromDate?: string;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
  containerStatus?: RequestContainerStatus;
}

export interface RequestContainersFiltersForm2 {
  searchKeyword?: string;
  foundation?: { id: string; title: string };
  nextStep?: { title: string };
  sector?: { id: string; title: string };
  fromDate?: string;
  name?: string;
  hasAccess?: boolean;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
  containerStatus?: RequestContainerStatus;
  priority?: { id: string; title: string };
  classification?: { id: string; title: string };
}
