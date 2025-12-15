import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReceiptComponent } from './delivery-receipt.component';

describe('DeliveryReceiptsComponent', () => {
  let component: DeliveryReceiptComponent;
  let fixture: ComponentFixture<DeliveryReceiptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryReceiptComponent],
    });
    fixture = TestBed.createComponent(DeliveryReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
