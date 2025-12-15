import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeGregorianCalendarComponent } from './range-gregorian-calendar.component';

describe('RangeGregorianCalendarComponent', () => {
  let component: RangeGregorianCalendarComponent;
  let fixture: ComponentFixture<RangeGregorianCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RangeGregorianCalendarComponent]
    });
    fixture = TestBed.createComponent(RangeGregorianCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
