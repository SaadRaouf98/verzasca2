import { TestBed } from '@angular/core/testing';

import { RecommendationTypesService } from './recommendation-types.service';

describe('RecommendationTypesService', () => {
  let service: RecommendationTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendationTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
