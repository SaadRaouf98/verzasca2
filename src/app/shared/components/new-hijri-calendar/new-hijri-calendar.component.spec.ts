import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHijriCalendarComponent } from './new-hijri-calendar.component';

describe('NewHijriCalendarComponent', () => {
  let component: NewHijriCalendarComponent;
  let fixture: ComponentFixture<NewHijriCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewHijriCalendarComponent]
    });
    fixture = TestBed.createComponent(NewHijriCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
