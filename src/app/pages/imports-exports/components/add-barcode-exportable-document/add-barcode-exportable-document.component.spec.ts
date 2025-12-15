import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBarcodeExportableDocumentComponent } from './add-barcode-exportable-document.component';

describe('AddBarcodeExportableDocumentComponent', () => {
  let component: AddBarcodeExportableDocumentComponent;
  let fixture: ComponentFixture<AddBarcodeExportableDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddBarcodeExportableDocumentComponent]
    });
    fixture = TestBed.createComponent(AddBarcodeExportableDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
