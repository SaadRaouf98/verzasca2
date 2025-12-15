import { TestBed } from '@angular/core/testing';

import { ManageTimeAttendanceService } from './manage-time-attendance.service';

describe('ManageTimeAttendanceService', () => {
  let service: ManageTimeAttendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageTimeAttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
