import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsPanelComponent } from './transaction-details-panel.component';

describe('DetailsComponent', () => {
  let component: TransactionDetailsPanelComponent;
  let fixture: ComponentFixture<TransactionDetailsPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TransactionDetailsPanelComponent]
    });
    fixture = TestBed.createComponent(TransactionDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
