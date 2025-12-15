import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryReceiptsListComponent } from './delivery-receipts-list.component';

describe('DeliveryReceiptsListComponent', () => {
  let component: DeliveryReceiptsListComponent;
  let fixture: ComponentFixture<DeliveryReceiptsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryReceiptsListComponent]
    });
    fixture = TestBed.createComponent(DeliveryReceiptsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
