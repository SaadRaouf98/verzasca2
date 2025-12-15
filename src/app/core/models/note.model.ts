import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

export interface Note {
  id: string;
  title: string;
  description: string;
  exportNumber: number;
  committee: {
    id: string;
    title: string;
    symbol: string;
  };
  classification: {
    id: string;
    title: string;
  };

  priority: {
    id: string;
    title: string;
  };

  isSigned: boolean;

  requestContainer: {
    id: string;
    autoNumber: number;
    transactionNumber: number;
    year: number;
  };

  transactionNumber: number;
  consultants: consultant[];
  date: string;
  documentType: ExportedDocumentType;
  isRestricted: boolean;
}

export interface AllNotes {
  data: Note[];
  totalCount: number;
  groupCount: number;
}

export interface NotesFiltersForm {
  searchKeyword?: string;
  classificationId?: string;
  priorityId?: string;
  documentType?: string;
  consultantId?: string;
  isInitiated?: boolean;
  isSigned?: boolean;
  fromDate?: string;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
  priority?:any
}
export interface consultant {
id:string
isMain: number
name: string,
type: number
}
export interface NoteDetails {
  title: string;
  hasSignatureAction: boolean;
  consultant: { id: string; name: string } | null;
  exportNumber: number;
  documentType: ExportedDocumentType;
}
