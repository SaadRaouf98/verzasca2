import { TestBed } from '@angular/core/testing';

import { ManageCommitteesService } from './manage-committees.service';

describe('ManageCommitteesService', () => {
  let service: ManageCommitteesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageCommitteesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
