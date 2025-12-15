import { TestBed } from '@angular/core/testing';

import { FromDateToDateSearchService } from './from-date-to-date-search.service';

describe('FromDateToDateSearchService', () => {
  let service: FromDateToDateSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromDateToDateSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
