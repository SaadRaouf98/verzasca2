import { TestBed } from '@angular/core/testing';

import { ManageSecretarialsService } from './manage-secretariats.service';

describe('ManageSecretarialsService', () => {
  let service: ManageSecretarialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageSecretarialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
