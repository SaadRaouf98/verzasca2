import { TestBed } from '@angular/core/testing';

import { ManageActorsService } from './manage-actors.service';

describe('ManageActorsService', () => {
  let service: ManageActorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageActorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
