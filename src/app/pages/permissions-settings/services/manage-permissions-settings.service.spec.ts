import { TestBed } from '@angular/core/testing';

import { ManagePermissionsSettingsService } from './manage-permissions-settings.service';

describe('ManagePermissionsSettingsService', () => {
  let service: ManagePermissionsSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagePermissionsSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
