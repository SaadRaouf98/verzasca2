import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendMeetingMembersComponent } from './attend-meeting-members.component';

describe('AttendMeetingMembersComponent', () => {
  let component: AttendMeetingMembersComponent;
  let fixture: ComponentFixture<AttendMeetingMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendMeetingMembersComponent]
    });
    fixture = TestBed.createComponent(AttendMeetingMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
