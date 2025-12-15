import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDeliveryReceiptModalComponent } from './update-delivery-receipt-modal.component';

describe('UpdateDeliveryReceiptModalComponent', () => {
  let component: UpdateDeliveryReceiptModalComponent;
  let fixture: ComponentFixture<UpdateDeliveryReceiptModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateDeliveryReceiptModalComponent]
    });
    fixture = TestBed.createComponent(UpdateDeliveryReceiptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
