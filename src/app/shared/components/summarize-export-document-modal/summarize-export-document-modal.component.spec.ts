import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarizeExportDocumentModalComponent } from './summarize-export-document-modal.component';

describe('SummarizeExportDocumentModalComponent', () => {
  let component: SummarizeExportDocumentModalComponent;
  let fixture: ComponentFixture<SummarizeExportDocumentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SummarizeExportDocumentModalComponent]
    });
    fixture = TestBed.createComponent(SummarizeExportDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
