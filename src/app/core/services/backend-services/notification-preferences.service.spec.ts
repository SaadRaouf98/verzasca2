import { TestBed } from '@angular/core/testing';

import { NotificationPreferencesService } from './notification-preferences.service';

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
