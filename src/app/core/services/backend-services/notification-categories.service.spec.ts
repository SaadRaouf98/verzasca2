import { TestBed } from '@angular/core/testing';

import { NotificationCategoriesService } from './notification-categories.service';

describe('NotificationCategoriesService', () => {
  let service: NotificationCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
