import { TestBed } from '@angular/core/testing';

import { BenefitTypesService } from './benefit-types.service';

describe('BenefitTypesService', () => {
  let service: BenefitTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenefitTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
