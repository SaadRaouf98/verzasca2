import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommitteeMembersApprovalComponent } from './view-committee-members-approval.component';

describe('ViewCommitteeMembersApprovalComponent', () => {
  let component: ViewCommitteeMembersApprovalComponent;
  let fixture: ComponentFixture<ViewCommitteeMembersApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCommitteeMembersApprovalComponent]
    });
    fixture = TestBed.createComponent(ViewCommitteeMembersApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
