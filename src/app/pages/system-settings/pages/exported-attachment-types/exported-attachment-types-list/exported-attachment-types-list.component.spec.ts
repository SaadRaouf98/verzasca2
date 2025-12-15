import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportedAttachmentTypesListComponent } from './exported-attachment-types-list.component';

describe('ExportedAttachmentTypesListComponent', () => {
  let component: ExportedAttachmentTypesListComponent;
  let fixture: ComponentFixture<ExportedAttachmentTypesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportedAttachmentTypesListComponent]
    });
    fixture = TestBed.createComponent(ExportedAttachmentTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
