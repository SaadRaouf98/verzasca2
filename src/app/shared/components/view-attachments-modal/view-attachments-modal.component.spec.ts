import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttachmentsModalComponent } from './view-attachments-modal.component';

describe('ViewAttachmentsModalComponent', () => {
  let component: ViewAttachmentsModalComponent;
  let fixture: ComponentFixture<ViewAttachmentsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAttachmentsModalComponent]
    });
    fixture = TestBed.createComponent(ViewAttachmentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
