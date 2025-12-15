import { TestBed } from '@angular/core/testing';

import { ExportedAttachmentTypesService } from './exported-attachment-types.service';

describe('ExportedAttachmentTypesService', () => {
  let service: ExportedAttachmentTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportedAttachmentTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
