import { TestBed } from '@angular/core/testing';

import { FoundationsSearchService } from './foundations-search.service';

describe('FoundationsSearchService', () => {
  let service: FoundationsSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoundationsSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
