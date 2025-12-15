import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStatisticsSectionComponent } from './home-statistics-section.component';

describe('EventsTimelineModalComponent', () => {
  let component: HomeStatisticsSectionComponent;
  let fixture: ComponentFixture<HomeStatisticsSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeStatisticsSectionComponent]
    });
    fixture = TestBed.createComponent(HomeStatisticsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
