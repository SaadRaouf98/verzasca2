import { TestBed } from '@angular/core/testing';

import { RegularReportsService } from './regular-reports.service';

describe('RegularReportsService', () => {
  let service: RegularReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegularReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
