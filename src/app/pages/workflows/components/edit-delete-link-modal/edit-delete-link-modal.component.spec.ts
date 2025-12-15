import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeleteLinkModalComponent } from './edit-delete-link-modal.component';

describe('EditDeleteLinkModalComponent', () => {
  let component: EditDeleteLinkModalComponent;
  let fixture: ComponentFixture<EditDeleteLinkModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditDeleteLinkModalComponent]
    });
    fixture = TestBed.createComponent(EditDeleteLinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
