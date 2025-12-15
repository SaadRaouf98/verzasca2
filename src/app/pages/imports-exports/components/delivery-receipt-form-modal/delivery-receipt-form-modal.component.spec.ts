import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReceiptFormModalComponent } from './delivery-receipt-form-modal.component';

describe('DeliveryReceiptFormModalComponent', () => {
  let component: DeliveryReceiptFormModalComponent;
  let fixture: ComponentFixture<DeliveryReceiptFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryReceiptFormModalComponent]
    });
    fixture = TestBed.createComponent(DeliveryReceiptFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
