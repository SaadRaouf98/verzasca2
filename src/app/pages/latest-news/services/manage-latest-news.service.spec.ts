import { TestBed } from '@angular/core/testing';

import { ManageLatestNewsService } from './manage-latest-news.service';

describe('ManageLatestNewsService', () => {
  let service: ManageLatestNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageLatestNewsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
