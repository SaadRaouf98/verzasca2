import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImportAttachmentsComponent } from './add-import-attachments.component';

describe('AddImportAttachmentsComponent', () => {
  let component: AddImportAttachmentsComponent;
  let fixture: ComponentFixture<AddImportAttachmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddImportAttachmentsComponent]
    });
    fixture = TestBed.createComponent(AddImportAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
