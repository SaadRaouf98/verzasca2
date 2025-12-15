import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledRequestContainersScrollableTableComponent } from './scheduled-request-containers-scrollable-table.component';

describe('ScheduledRequestContainersScrollableTableComponent', () => {
  let component: ScheduledRequestContainersScrollableTableComponent;
  let fixture: ComponentFixture<ScheduledRequestContainersScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduledRequestContainersScrollableTableComponent]
    });
    fixture = TestBed.createComponent(ScheduledRequestContainersScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
