import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceScrollableTableComponent } from './attendance-scrollable-table.component';

describe('AttendanceScrollableTableComponent', () => {
  let component: AttendanceScrollableTableComponent;
  let fixture: ComponentFixture<AttendanceScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceScrollableTableComponent]
    });
    fixture = TestBed.createComponent(AttendanceScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
