import { Injectable } from '@angular/core';
import { DocumentsLibraryService } from '@core/services/backend-services/documents-library.service';

@Injectable({
  providedIn: 'root',
})
export class ManageFilesDocumentsService {
  constructor(public documentsLibraryService: DocumentsLibraryService) {}
}
