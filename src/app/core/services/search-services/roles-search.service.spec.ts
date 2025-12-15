import { TestBed } from '@angular/core/testing';

import { RolesSearchService } from './roles-search.service';

describe('RolesSearchService', () => {
  let service: RolesSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
