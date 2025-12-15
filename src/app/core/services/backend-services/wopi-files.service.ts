import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { RequestAttachmentImageCommand } from '@core/models/request.model';
import { objectToFormData } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class WopiFilesService {
  readonly apiUrl = '/api/wopi/files';

  constructor(private apiService: ApiService) {}

  createFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.apiService.postFormData(`${this.apiUrl}`, formData);
  }

  updateBarcodePositionsOnPdfFile(
    fileId: string,
    data: RequestAttachmentImageCommand
  ): Observable<any> {
    return this.apiService.putFormData(`${this.apiUrl}/${fileId}/image`, objectToFormData(data));
  }
  getFileBlob(fileId: string, returnUpdatedFile?: boolean): Observable<Blob> {
    let url = `${this.apiUrl}/${fileId}`;
    if (typeof returnUpdatedFile === 'boolean') {
      url += `?returnUpdatedFile=${returnUpdatedFile}`;
    }
    return this.apiService.getFile(url);
  }
  getFileByPath(path: string): Observable<Blob> {
    let url = `${this.apiUrl}/by-path?path=${path}`;
    return this.apiService.getFile(url);
  }
  getTemporaryFile(fileId: string, returnUpdatedFile?: boolean): Observable<Blob> {
    let url = `${this.apiUrl}/temporary/${fileId}`;
    if (typeof returnUpdatedFile === 'boolean') {
      url += `?returnUpdatedFile=${returnUpdatedFile}`;
    }
    return this.apiService.getFile(url);
  }
}
