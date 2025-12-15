import { TestBed } from '@angular/core/testing';

import { WopiFilesService } from './wopi-files.service';

describe('WopiFilesService', () => {
  let service: WopiFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WopiFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
