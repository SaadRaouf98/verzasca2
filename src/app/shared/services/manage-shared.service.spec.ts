import { TestBed } from '@angular/core/testing';

import { ManageSharedService } from './manage-shared.service';

describe('ManageSharedService', () => {
  let service: ManageSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
