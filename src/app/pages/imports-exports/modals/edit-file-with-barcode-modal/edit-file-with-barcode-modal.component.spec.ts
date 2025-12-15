import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFileWithBarcodeModalComponent } from './edit-file-with-barcode-modal.component';

describe('EditFileWithBarcodeModalComponent', () => {
  let component: EditFileWithBarcodeModalComponent;
  let fixture: ComponentFixture<EditFileWithBarcodeModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditFileWithBarcodeModalComponent]
    });
    fixture = TestBed.createComponent(EditFileWithBarcodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
