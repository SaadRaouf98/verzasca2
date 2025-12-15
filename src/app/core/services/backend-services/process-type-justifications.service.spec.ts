import { TestBed } from '@angular/core/testing';

import { ProcessTypeJustificationsService } from './process-type-justifications.service';

describe('ProcessTypeJustificationsService', () => {
  let service: ProcessTypeJustificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessTypeJustificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
