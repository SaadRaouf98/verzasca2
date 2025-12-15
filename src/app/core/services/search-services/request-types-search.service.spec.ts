import { TestBed } from '@angular/core/testing';

import { RequestTypesSearchService } from './request-types-search.service';

describe('RequestTypesSearchService', () => {
  let service: RequestTypesSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestTypesSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
