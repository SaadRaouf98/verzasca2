import { TestBed } from '@angular/core/testing';

import { ManageRegularReportsService } from './manage-regular-reports.service';

describe('ManageRegularReportsService', () => {
  let service: ManageRegularReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageRegularReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
