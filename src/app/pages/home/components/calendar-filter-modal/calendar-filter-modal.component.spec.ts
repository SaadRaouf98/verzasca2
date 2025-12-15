import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarFilterModalComponent } from './calendar-filter-modal.component';

describe('CalendarFilterModalComponent', () => {
  let component: CalendarFilterModalComponent;
  let fixture: ComponentFixture<CalendarFilterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarFilterModalComponent]
    });
    fixture = TestBed.createComponent(CalendarFilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
