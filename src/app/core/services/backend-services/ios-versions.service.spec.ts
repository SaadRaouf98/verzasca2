import { TestBed } from '@angular/core/testing';

import { IosVersionsService } from './ios-versions.service';

describe('IosVersionsService', () => {
  let service: IosVersionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IosVersionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
