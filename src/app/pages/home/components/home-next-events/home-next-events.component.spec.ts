import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeNextEventsComponent } from './home-next-events.component';

describe('HijriCalendarModalComponent', () => {
  let component: HomeNextEventsComponent;
  let fixture: ComponentFixture<HomeNextEventsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeNextEventsComponent]
    });
    fixture = TestBed.createComponent(HomeNextEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
