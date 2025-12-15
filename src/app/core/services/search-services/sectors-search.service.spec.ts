import { TestBed } from '@angular/core/testing';

import { SectorsSearchService } from './sectors-search.service';

describe('SectorsSearchService', () => {
  let service: SectorsSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SectorsSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
