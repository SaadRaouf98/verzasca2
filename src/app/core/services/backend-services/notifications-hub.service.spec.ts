import { TestBed } from '@angular/core/testing';

import { NotificationsHubService } from './notifications-hub.service';

describe('NotificationsHubService', () => {
  let service: NotificationsHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
