import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExportDocumentComponent } from './add-export-document.component';

describe('AddExportDocumentComponent', () => {
  let component: AddExportDocumentComponent;
  let fixture: ComponentFixture<AddExportDocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExportDocumentComponent]
    });
    fixture = TestBed.createComponent(AddExportDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
