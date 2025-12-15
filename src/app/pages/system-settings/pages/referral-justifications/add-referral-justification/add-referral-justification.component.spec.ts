import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReferralJustificationComponent } from './add-referral-justification.component';

describe('AddReferralJustificationComponent', () => {
  let component: AddReferralJustificationComponent;
  let fixture: ComponentFixture<AddReferralJustificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddReferralJustificationComponent]
    });
    fixture = TestBed.createComponent(AddReferralJustificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
