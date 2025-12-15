import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeHijriCalendarComponent } from './range-hijri-calendar.component';

describe('RangeHijriCalendarComponent', () => {
  let component: RangeHijriCalendarComponent;
  let fixture: ComponentFixture<RangeHijriCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RangeHijriCalendarComponent]
    });
    fixture = TestBed.createComponent(RangeHijriCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
