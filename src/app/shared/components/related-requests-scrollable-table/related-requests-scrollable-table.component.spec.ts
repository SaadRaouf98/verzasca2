import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedRequestsScrollableTableComponent } from './related-requests-scrollable-table.component';

describe('RelatedTransactionsScrollableTableComponent', () => {
  let component: RelatedRequestsScrollableTableComponent;
  let fixture: ComponentFixture<RelatedRequestsScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelatedRequestsScrollableTableComponent],
    });
    fixture = TestBed.createComponent(RelatedRequestsScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
