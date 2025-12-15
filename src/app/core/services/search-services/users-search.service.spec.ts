import { TestBed } from '@angular/core/testing';

import { UsersSearchService } from './users-search.service';

describe('UserSearchService', () => {
  let service: UsersSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
