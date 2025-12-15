import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMeetingsListComponent } from './manage-meetings-list.component';

describe('TimeTableListComponent', () => {
  let component: ManageMeetingsListComponent;
  let fixture: ComponentFixture<ManageMeetingsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageMeetingsListComponent],
    });
    fixture = TestBed.createComponent(ManageMeetingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
