import { TestBed } from '@angular/core/testing';

import { ManageNotesService } from './manage-notes.service';

describe('ManageNotesService', () => {
  let service: ManageNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
