import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTransactionsFiltersComponent } from './pending-transactions-filters.component';

describe('PendingTransactionsFiltersComponent', () => {
  let component: PendingTransactionsFiltersComponent;
  let fixture: ComponentFixture<PendingTransactionsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingTransactionsFiltersComponent]
    });
    fixture = TestBed.createComponent(PendingTransactionsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
