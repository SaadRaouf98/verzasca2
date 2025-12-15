import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyProjectModalComponent } from './study-project-modal.component';

describe('StudyProjectModalComponent', () => {
  let component: StudyProjectModalComponent;
  let fixture: ComponentFixture<StudyProjectModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudyProjectModalComponent]
    });
    fixture = TestBed.createComponent(StudyProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
