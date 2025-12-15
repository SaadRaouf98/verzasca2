import { TestBed } from '@angular/core/testing';

import { ManageTransactionsService } from './manage-transactions.service';

describe('ManageTransactionsService', () => {
  let service: ManageTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
