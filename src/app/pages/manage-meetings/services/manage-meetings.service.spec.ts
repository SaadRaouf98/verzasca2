import { TestBed } from '@angular/core/testing';

import { ManageMeetingsService } from './manage-meetings.service';

describe('ManageTimeTableService', () => {
  let service: ManageMeetingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageMeetingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
