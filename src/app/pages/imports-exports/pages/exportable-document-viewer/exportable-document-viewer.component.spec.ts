import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportableDocumentViewerComponent } from './exportable-document-viewer.component';

describe('ExportableDocumentViewerComponent', () => {
  let component: ExportableDocumentViewerComponent;
  let fixture: ComponentFixture<ExportableDocumentViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportableDocumentViewerComponent]
    });
    fixture = TestBed.createComponent(ExportableDocumentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
