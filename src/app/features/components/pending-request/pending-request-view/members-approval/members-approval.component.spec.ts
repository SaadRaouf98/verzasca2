import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersApprovalComponent } from './members-approval.component';

describe('MembersApprovalComponent', () => {
  let component: MembersApprovalComponent;
  let fixture: ComponentFixture<MembersApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MembersApprovalComponent]
    });
    fixture = TestBed.createComponent(MembersApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
