import { Injectable } from '@angular/core';
import { OcrParserFilesService } from '@core/services/backend-services/ocr-parser-files.service';

@Injectable({
  providedIn: 'root',
})
export class ManageOcrService {
  constructor(public ocrParserFilesService: OcrParserFilesService) {}
}
