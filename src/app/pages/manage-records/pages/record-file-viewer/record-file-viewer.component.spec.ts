import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFileViewerComponent } from './record-file-viewer.component';

describe('RecordFileViewerComponent', () => {
  let component: RecordFileViewerComponent;
  let fixture: ComponentFixture<RecordFileViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecordFileViewerComponent],
    });
    fixture = TestBed.createComponent(RecordFileViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
