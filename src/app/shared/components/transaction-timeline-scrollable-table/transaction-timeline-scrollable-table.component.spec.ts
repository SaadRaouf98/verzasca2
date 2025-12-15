import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTimelineScrollableTableComponent } from './transaction-timeline-scrollable-table.component';

describe('TransactionTimelineScrollableTableComponent', () => {
  let component: TransactionTimelineScrollableTableComponent;
  let fixture: ComponentFixture<TransactionTimelineScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionTimelineScrollableTableComponent]
    });
    fixture = TestBed.createComponent(TransactionTimelineScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
