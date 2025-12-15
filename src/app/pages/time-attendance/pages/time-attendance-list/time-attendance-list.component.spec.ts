import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAttendanceListComponent } from './time-attendance-list.component';

describe('TimeAttendanceListComponent', () => {
  let component: TimeAttendanceListComponent;
  let fixture: ComponentFixture<TimeAttendanceListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeAttendanceListComponent]
    });
    fixture = TestBed.createComponent(TimeAttendanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
