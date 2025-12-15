import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmMeetingAttendanceComponent } from './confirm-meeting-attendance.component';

describe('ConfirmMeetingAttendanceComponent', () => {
  let component: ConfirmMeetingAttendanceComponent;
  let fixture: ComponentFixture<ConfirmMeetingAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmMeetingAttendanceComponent]
    });
    fixture = TestBed.createComponent(ConfirmMeetingAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
