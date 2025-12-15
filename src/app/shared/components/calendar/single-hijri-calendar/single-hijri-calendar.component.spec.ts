import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleHijriCalendarComponent } from './single-hijri-calendar.component';

describe('SingleHijriCalendarComponent', () => {
  let component: SingleHijriCalendarComponent;
  let fixture: ComponentFixture<SingleHijriCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleHijriCalendarComponent]
    });
    fixture = TestBed.createComponent(SingleHijriCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
