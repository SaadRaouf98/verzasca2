import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class OcrParserFilesService {
  private readonly baseUrl = environment.ocrAndSolarApi;
  private readonly apiUrl = '/api/v1/ocrparserfiles';

  constructor(private apiService: ApiService) {}

  uploadPdf(pdfFile: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('PdfFile', pdfFile, pdfFile.name);
    return this.apiService.putFormData(`${this.apiUrl}`, formData, true);
  }

  uploadImage(image: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('File', image);
    return this.apiService.postFormData(`/api/v1/ocr`, formData);
  }
  //  uploadImageOLD(image: File): Observable<{ content: string }> {
  //   const formData: FormData = new FormData();
  //   formData.append('Image', image, image.name);
  //   return this.apiService.putFormData(`${this.apiUrl}/images`, formData, true);
  // }
}
