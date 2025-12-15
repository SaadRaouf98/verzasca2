import { DocumentExportWay } from '@core/enums/document-export-way.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { PlaceHolder } from './placeHolder.model';
import { ExportedDocumentStatus } from '@core/enums/exported-document-status.enum';

export interface AddExportDocumentCommand {
  physicalDate: string;
  exportingMethod: DocumentExportWay;
  documentType: ExportedDocumentType;
  otherDocumentTypeId?: string;
  exportedToRC: boolean;
  foundationsIds?: string;
  requestId: string | null;
  // document: File;
  document?: string;
  title: string;
  description: string;
  barcode?: PlaceHolder;
  classificationId: string;
  usersIds: string[];
  documentId?: string;
  attachmentIds?: string[];
}

export interface UpdateExportDocumentCommand {
  id: string;
  physicalDate: string;
  exportingMethod: DocumentExportWay;
  documentType: ExportedDocumentType;
  otherDocumentTypeId?: string;
  exportedToRC: boolean;
  foundationsIds?: string;
  // document: File;
  document?: string;
  title: string;
  description: string;
  classificationId: string;
  usersIds: string[];
  documentId?: string;
  attachmentIds?: string[];
}

export interface ExportableDocument {
  id?: string;
  title?: string;
  description?: string;
  physicalDate?: string;
  exportedDate?: string;
  umAlQuraPhysicalDate?: string;
  umAlQuraExportedDate?: string;
  exportingMethod?: DocumentExportWay;
  documentType?: ExportedDocumentType;
  exportedToRC?: true;
  exportNumber?: number;
  physicalNumber?: number;
  deliveryDate?: string;
  deliveryNumber?: number;
  autoNumber: number;
  requestContainer?: {
    id: string;
    title: string;
    transactionNumber: number;
  };
  code: string;
  foundations?: {
    id: string;
    title: string;
    titleEn: string;
  }[];
  request?: {
    id: string;
    title: string;
    number?: number;
    autoNumber?: number;
  };
  document?: {
    id: string;
    name: string;
    path: string;
    contentType: string;
  };
  attachments?: any;
  hasAmounts?: boolean;
  otherDocumentType?: {
    id: string;
    title: string;
  } | null;
  isInitiated?: boolean;
  isSigned?: boolean;
  status?: ExportedDocumentStatus;
  attachmentDescription?: string;
  classification?: {
    id: string;
    title: string;
    titleEn: string;
  };
  users?: {
    id: string;
    name: string;
  }[];
}

export interface BarcodeNoBackgroundDetails {
  attachmentDescription: string;
  autoNumber: number;
  barcode: string;
  base64Barcode: string;
  date: string;
  deliveryDate: string;
  documentType: ExportedDocumentType;
  hijriDate: string;
  isExportDocument: boolean;
  number: number;
  priority: string;
}
