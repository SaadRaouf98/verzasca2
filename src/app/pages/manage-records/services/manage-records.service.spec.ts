import { TestBed } from '@angular/core/testing';

import { ManageRecordsService } from './manage-records.service';

describe('ManageRecordsService', () => {
  let service: ManageRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
