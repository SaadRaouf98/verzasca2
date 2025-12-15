import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReUploadDocumentModalComponent } from './re-upload-document-modal.component';

describe('ReUploadRecordModalComponent', () => {
  let component: ReUploadDocumentModalComponent;
  let fixture: ComponentFixture<ReUploadDocumentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReUploadDocumentModalComponent],
    });
    fixture = TestBed.createComponent(ReUploadDocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
