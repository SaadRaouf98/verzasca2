import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExportedAttachmentTypeComponent } from './add-exported-attachment-type.component';

describe('AddExportedAttachmentTypeComponent', () => {
  let component: AddExportedAttachmentTypeComponent;
  let fixture: ComponentFixture<AddExportedAttachmentTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExportedAttachmentTypeComponent]
    });
    fixture = TestBed.createComponent(AddExportedAttachmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
