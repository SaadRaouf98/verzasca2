import { TestBed } from '@angular/core/testing';

import { ManageMyProfileService } from './manage-my-profile.service';

describe('ManageMyProfileService', () => {
  let service: ManageMyProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageMyProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
