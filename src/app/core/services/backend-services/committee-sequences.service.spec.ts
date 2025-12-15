import { TestBed } from '@angular/core/testing';

import { CommitteeSequencesService } from './committee-sequences.service';

describe('CommitteeSequencesService', () => {
  let service: CommitteeSequencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommitteeSequencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
