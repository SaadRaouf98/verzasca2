import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralJustificationsListComponent } from './referral-justifications-list.component';

describe('ReferralJustificationsListComponent', () => {
  let component: ReferralJustificationsListComponent;
  let fixture: ComponentFixture<ReferralJustificationsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferralJustificationsListComponent]
    });
    fixture = TestBed.createComponent(ReferralJustificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
