import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWorkflowTreatmentComponent } from './add-workflow-treatment.component';

describe('AddWorkflowTreatmentComponent', () => {
  let component: AddWorkflowTreatmentComponent;
  let fixture: ComponentFixture<AddWorkflowTreatmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddWorkflowTreatmentComponent]
    });
    fixture = TestBed.createComponent(AddWorkflowTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
