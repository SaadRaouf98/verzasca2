import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriDateRangeComponent } from './hijri-date-range.component';

describe('HijriDateRangeComponent', () => {
  let component: HijriDateRangeComponent;
  let fixture: ComponentFixture<HijriDateRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HijriDateRangeComponent]
    });
    fixture = TestBed.createComponent(HijriDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
