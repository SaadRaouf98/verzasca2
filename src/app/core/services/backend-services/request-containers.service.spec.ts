import { TestBed } from '@angular/core/testing';

import { RequestContainersService } from './request-containers.service';

describe('RequestContainersService', () => {
  let service: RequestContainersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestContainersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
