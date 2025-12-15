import { TestBed } from '@angular/core/testing';

import { ManageSystemSettingsService } from './manage-system-settings.service';

describe('ManageActionsService', () => {
  let service: ManageSystemSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageSystemSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
