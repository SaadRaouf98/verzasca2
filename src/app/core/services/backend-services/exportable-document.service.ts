import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  AddExportDocumentCommand,
  BarcodeNoBackgroundDetails,
  ExportableDocument,
  UpdateExportDocumentCommand,
} from '@core/models/exportable-document.model';
import { objectToFormData } from '@shared/helpers/helpers';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ExportableDocumentService {
  readonly apiUrl = '/api/v1/exportabledocument';

  constructor(private apiService: ApiService) {}

  getExportableDocumentById(id: string): Observable<ExportableDocument> {
    return this.apiService.get(`${this.apiUrl}/${id}`);
  }
addImportExportAttachement(documentId,attachmentId){
   return this.apiService.put(`${this.apiUrl}/${documentId}/attachments/${attachmentId}`,{});
}
  deleteExportableDocumentById(id: string): Observable<null> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  getExportablePdfDocument(
    documentId: string,
    isExport: boolean = false
  ): Observable<Blob> {
    return this.apiService.getFile(
      `${this.apiUrl}/${documentId}/document?isExport=${isExport}`
    );
  }

  addExportableDocument(
    data: AddExportDocumentCommand
  ): Observable<{ id: string; exportNumber: number }> {
    return this.apiService.post(this.apiUrl, data);
  }

  updateExportableDocument(data: UpdateExportDocumentCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${data.id}`, data);
  }

  updateExportableDocumentAttachment(
    documentId: string,
    description: string
  ): Observable<BarcodeNoBackgroundDetails> {
    return this.apiService.put(
      `${this.apiUrl}/${documentId}/attachment-description`,
      description ? description : ''
    );
  }

  private getImportFormData(
    data: AddExportDocumentCommand | UpdateExportDocumentCommand
  ): FormData {
    const formData: FormData = objectToFormData(data);

    return formData;
  }

  getBarcode(
    documentId: string,
    withTemplate: boolean = true
  ): Observable<string> {
    return this.apiService.get(
      `${this.apiUrl}/${documentId}/barcode?withTemplate=${withTemplate}`
    );
  }

  //////////////////////////  رقم الصادر //////////////////////////////
  getExportNumber(
    documentType: ExportedDocumentType,
    requestId?: string
  ): Observable<number> {
    let url = `${this.apiUrl}/${documentType}/export-number`;
    if (requestId) {
      url += `?requestId=${requestId}`;
    }
    return this.apiService.get(url);
  }
}
