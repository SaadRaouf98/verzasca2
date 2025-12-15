import { TestBed } from '@angular/core/testing';

import { ManagePendingTransactionsService } from './manage-pending-transactions.service';

describe('ManagePendingTransactionsService', () => {
  let service: ManagePendingTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagePendingTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
