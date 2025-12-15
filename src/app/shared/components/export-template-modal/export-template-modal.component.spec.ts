import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportTemplateModalComponent } from './export-template-modal.component';

describe('ExportTemplateModalComponent', () => {
  let component: ExportTemplateModalComponent;
  let fixture: ComponentFixture<ExportTemplateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportTemplateModalComponent]
    });
    fixture = TestBed.createComponent(ExportTemplateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
