import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceAndDepartureCardComponent } from './attendance-and-departure-card.component';

describe('MyProfileComponent', () => {
  let component: AttendanceAndDepartureCardComponent;
  let fixture: ComponentFixture<AttendanceAndDepartureCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceAndDepartureCardComponent]
    });
    fixture = TestBed.createComponent(AttendanceAndDepartureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
