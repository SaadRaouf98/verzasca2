import { TestBed } from '@angular/core/testing';

import { ManageRequestTypesService } from './manage-request-types.service';

describe('ManageRequestTypesService', () => {
  let service: ManageRequestTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageRequestTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
