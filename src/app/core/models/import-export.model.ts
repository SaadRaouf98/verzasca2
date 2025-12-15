import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

//TODO: This interface is implemented before the api's properties is is made
export interface ImportExport {
  id: string;
  number: string;
  requestType: {
    id: string;
    title: string;
    titleEn: string;
   
  };
  isExportDocument: boolean;
 requestId?:string;
  title: string;
  titleEn: string;

  documentType: ExportedDocumentType;
  otherDocumentType: {
    id: string;
    title: string;
  } | null;
  date: string;
  viewWatchButton: boolean;
  isRestricted: boolean;
  formattedRequestType?: string;
  description?: string;
}
