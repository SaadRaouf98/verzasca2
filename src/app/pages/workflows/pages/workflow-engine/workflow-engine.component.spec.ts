import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowEngineComponent } from './workflow-engine.component';

describe('WorkflowEngineComponent', () => {
  let component: WorkflowEngineComponent;
  let fixture: ComponentFixture<WorkflowEngineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkflowEngineComponent]
    });
    fixture = TestBed.createComponent(WorkflowEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
