import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTransactionsListPage } from './pending-transactions-list.page';

describe('PendingTransactionsListPage', () => {
  let component: PendingTransactionsListPage;
  let fixture: ComponentFixture<PendingTransactionsListPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingTransactionsListPage],
    });
    fixture = TestBed.createComponent(PendingTransactionsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
