import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriCalendarModalComponent } from './hijri-calendar-modal.component';

describe('HijriCalendarModalComponent', () => {
  let component: HijriCalendarModalComponent;
  let fixture: ComponentFixture<HijriCalendarModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HijriCalendarModalComponent]
    });
    fixture = TestBed.createComponent(HijriCalendarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
