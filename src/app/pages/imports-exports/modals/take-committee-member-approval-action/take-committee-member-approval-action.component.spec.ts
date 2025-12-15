import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeCommitteeMemberApprovalActionComponent } from './take-committee-member-approval-action.component';

describe('TakeCommitteeMemberApprovalActionComponent', () => {
  let component: TakeCommitteeMemberApprovalActionComponent;
  let fixture: ComponentFixture<TakeCommitteeMemberApprovalActionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TakeCommitteeMemberApprovalActionComponent]
    });
    fixture = TestBed.createComponent(TakeCommitteeMemberApprovalActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
