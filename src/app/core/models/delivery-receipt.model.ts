import { DeliveryReceiptAttachmentType } from '@core/enums/delivery-receipt-attachment-type.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

export interface DeliveryReceipt {
  id: string;
  autoNumber: number;
  exportNumber: number;
  exportedDate: string;
  hijriExportedDate: string;
  documentType: ExportedDocumentType;
  attachmentType: DeliveryReceiptAttachmentType;
  otherAttachmentType: string;
  attachments: string;
  foundation: {
    id: string;
    title: string;
    titleEn: string;
  };
  subFoundation: {
    id: string;
    title: string;
    titleEn: string;
  };
  foundationDescription: string;
  isFinanceCommittee: boolean;
  priority: {
    id: string;
    title: string;
  };
}

export interface AllDeliveryReceipt {
  id: string;
  autoNumber: number;
  date: string;
  hijriDate: string;
  items: DeliveryReceipt[];
}
export interface DeliveryReceiptBasicRow {
  id: string;
  autoNumber: number;
  exportNumber: number;
  exportedDate: string;
  hijriExportedDate: string;

  documentType: ExportedDocumentType;
  attachmentType: DeliveryReceiptAttachmentType;
  otherAttachmentType: string;
  attachments: string;
  foundation: {
    id: string;
    title: string;
    titleEn: string;
  };
  subFoundation: {
    id: string;
    title: string;
    titleEn: string;
  };
  foundationDescription: string;
  isFinanceCommittee: true;
}

export interface UpdateDeliveryReceiptsRowsCommand {
  id: string;
  attachmentType: DeliveryReceiptAttachmentType;
  otherAttachmentType: string;
  attachments: string;
  foundationDescription: string;
  subFoundationId: string;
}

export interface DeliveryReceiptTableRow {
  id: string;
  autoNumber: number;
  date: string;
  deliveryDate: string;
  creator: {
    id: string;
    name: string;
  };
  itemsCount: number;
}
export interface AllDeliveryReceiptTable {
  data: DeliveryReceiptTableRow[];
  totalCount: number;
  groupCount: number;
}

export interface DeliveryReceiptsFiltersForm {
  creatorId?: string;
  fromDate?: string;
  toDate?: string;
  hijriFromDate?: string;
  hijriToDate?: string;
}
