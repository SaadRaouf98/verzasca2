import { TestBed } from '@angular/core/testing';

import { RequestTypesService } from './request-types.service';

describe('RequestTypesService', () => {
  let service: RequestTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
