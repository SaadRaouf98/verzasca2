import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNoteModalComponent } from './view-note-modal.component';

describe('ViewCommentModalComponent', () => {
  let component: ViewNoteModalComponent;
  let fixture: ComponentFixture<ViewNoteModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewNoteModalComponent],
    });
    fixture = TestBed.createComponent(ViewNoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
