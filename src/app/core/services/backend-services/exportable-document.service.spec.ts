import { TestBed } from '@angular/core/testing';

import { ExportableDocumentService } from './exportable-document.service';

describe('ExportableDocumentService', () => {
  let service: ExportableDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportableDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
