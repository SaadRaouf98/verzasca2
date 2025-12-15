import { TestBed } from '@angular/core/testing';

import { ManageFilesDocumentsService } from './manage-files-documents.service';

describe('ManageFilesDocumentsService', () => {
  let service: ManageFilesDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageFilesDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
