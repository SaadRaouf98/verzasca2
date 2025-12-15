import { TestBed } from '@angular/core/testing';

import { ManageHomeService } from './manage-home.service';

describe('ManageHomeService', () => {
  let service: ManageHomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageHomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
