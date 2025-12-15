import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestAttachmentViewerComponent } from './request-attachment-viewer.component';

describe('FileViewerComponent', () => {
  let component: RequestAttachmentViewerComponent;
  let fixture: ComponentFixture<RequestAttachmentViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestAttachmentViewerComponent],
    });
    fixture = TestBed.createComponent(RequestAttachmentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
