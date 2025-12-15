import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsTimelineModalComponent } from './events-timeline-modal.component';

describe('EventsTimelineModalComponent', () => {
  let component: EventsTimelineModalComponent;
  let fixture: ComponentFixture<EventsTimelineModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventsTimelineModalComponent]
    });
    fixture = TestBed.createComponent(EventsTimelineModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
