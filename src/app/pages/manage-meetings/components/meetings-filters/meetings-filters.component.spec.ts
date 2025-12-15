import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsFiltersComponent } from './meetings-filters.component';

describe('MeetingsFiltersComponent', () => {
  let component: MeetingsFiltersComponent;
  let fixture: ComponentFixture<MeetingsFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingsFiltersComponent]
    });
    fixture = TestBed.createComponent(MeetingsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
