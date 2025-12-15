import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStatisticsRecordsComponent } from './home-statistics-records.component';

describe('EventsTimelineModalComponent', () => {
  let component: HomeStatisticsRecordsComponent;
  let fixture: ComponentFixture<HomeStatisticsRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeStatisticsRecordsComponent]
    });
    fixture = TestBed.createComponent(HomeStatisticsRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
