import { TestBed } from '@angular/core/testing';

import { ManageOcrService } from './manage-ocr.service';

describe('ManageOcrService', () => {
  let service: ManageOcrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageOcrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
