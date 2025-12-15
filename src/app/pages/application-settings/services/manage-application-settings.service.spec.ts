import { TestBed } from '@angular/core/testing';

import { ManageApplicationSettingsService } from './manage-application-settings.service';

describe('ManageApplicationSettingsService', () => {
  let service: ManageApplicationSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageApplicationSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
