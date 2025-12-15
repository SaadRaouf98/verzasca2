import { TestBed } from '@angular/core/testing';

import { StepCategoriesService } from './step-categories.service';

describe('StepCategoriesService', () => {
  let service: StepCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
