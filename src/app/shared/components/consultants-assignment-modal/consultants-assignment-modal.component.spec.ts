import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantsAssignmentModalComponent } from './consultants-assignment-modal.component';

describe('ConsultantsAssignmentModalComponent', () => {
  let component: ConsultantsAssignmentModalComponent;
  let fixture: ComponentFixture<ConsultantsAssignmentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantsAssignmentModalComponent]
    });
    fixture = TestBed.createComponent(ConsultantsAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
