import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportableDocumentDetailsComponent } from './exportable-document-details.component';

describe('ExportableDocumentDetailsComponent', () => {
  let component: ExportableDocumentDetailsComponent;
  let fixture: ComponentFixture<ExportableDocumentDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportableDocumentDetailsComponent]
    });
    fixture = TestBed.createComponent(ExportableDocumentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
