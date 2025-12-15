import { TestBed } from '@angular/core/testing';

import { UmAlQuraCalendarService } from './um-al-qura-calendar.service';

describe('UmAlQuraCalendarService', () => {
  let service: UmAlQuraCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UmAlQuraCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
