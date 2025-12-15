import { TestBed } from '@angular/core/testing';

import { FoundationsService } from './foundations.service';

describe('FoundationsService', () => {
  let service: FoundationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoundationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
