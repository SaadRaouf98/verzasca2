import { TestBed } from '@angular/core/testing';

import { ManageWorkflowsService } from './manage-workflows.service';

describe('ManageWorkflowsService', () => {
  let service: ManageWorkflowsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageWorkflowsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
