import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTableFiltersModalComponent } from './time-table-filters-modal.component';

describe('TimeTableFiltersModalComponent', () => {
  let component: TimeTableFiltersModalComponent;
  let fixture: ComponentFixture<TimeTableFiltersModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeTableFiltersModalComponent]
    });
    fixture = TestBed.createComponent(TimeTableFiltersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
