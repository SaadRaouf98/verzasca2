import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTreatmentsListComponent } from './workflow-treatments-list.component';

describe('WorkflowTreatmentsListComponent', () => {
  let component: WorkflowTreatmentsListComponent;
  let fixture: ComponentFixture<WorkflowTreatmentsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowTreatmentsListComponent]
    });
    fixture = TestBed.createComponent(WorkflowTreatmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
