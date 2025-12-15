import { TestBed } from '@angular/core/testing';

import { ReferralJustificationsService } from './referral-justifications.service';

describe('ReferralJustificationsService', () => {
  let service: ReferralJustificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferralJustificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
