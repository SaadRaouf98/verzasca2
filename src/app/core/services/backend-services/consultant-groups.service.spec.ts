import { TestBed } from '@angular/core/testing';

import { ConsultantGroupsService } from './consultant-groups.service';

describe('ConsultantGroupsService', () => {
  let service: ConsultantGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultantGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
