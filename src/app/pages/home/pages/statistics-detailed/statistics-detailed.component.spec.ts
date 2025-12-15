import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsDetailedComponent } from './statistics-detailed.component';

describe('StatisticsDetailedComponent', () => {
  let component: StatisticsDetailedComponent;
  let fixture: ComponentFixture<StatisticsDetailedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatisticsDetailedComponent]
    });
    fixture = TestBed.createComponent(StatisticsDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
