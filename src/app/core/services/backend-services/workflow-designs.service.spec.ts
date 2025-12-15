import { TestBed } from '@angular/core/testing';

import { WorkflowDesignsService } from './workflow-designs.service';

describe('WorkflowsService', () => {
  let service: WorkflowDesignsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowDesignsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
