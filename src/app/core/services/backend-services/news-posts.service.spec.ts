import { TestBed } from '@angular/core/testing';

import { NewsPostsService } from './news-posts.service';

describe('NewsPostsService', () => {
  let service: NewsPostsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsPostsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
