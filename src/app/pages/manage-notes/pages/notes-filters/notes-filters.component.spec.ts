import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsFiltersComponent } from './transactions-filters.component';

describe('TableFiltersComponent', () => {
  let component: TransactionsFiltersComponent;
  let fixture: ComponentFixture<TransactionsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionsFiltersComponent],
    });
    fixture = TestBed.createComponent(TransactionsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
