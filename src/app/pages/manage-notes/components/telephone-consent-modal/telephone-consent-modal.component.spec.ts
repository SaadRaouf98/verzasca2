import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelephoneConsentModalComponent } from './telephone-consent-modal.component';

describe('UpdateAccessibilityModalComponent', () => {
  let component: TelephoneConsentModalComponent;
  let fixture: ComponentFixture<TelephoneConsentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TelephoneConsentModalComponent]
    });
    fixture = TestBed.createComponent(TelephoneConsentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
