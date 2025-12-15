import { TestBed } from '@angular/core/testing';

import { RequestContainerAdvancedSearchService } from './request-container-advanced-search.service';

describe('RequestContainerAdvancedSearchService', () => {
  let service: RequestContainerAdvancedSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestContainerAdvancedSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
