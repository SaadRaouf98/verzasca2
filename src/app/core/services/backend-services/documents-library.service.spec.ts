import { TestBed } from '@angular/core/testing';

import { DocumentsLibraryService } from './documents-library.service';

describe('DocumentsLibraryService', () => {
  let service: DocumentsLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentsLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
