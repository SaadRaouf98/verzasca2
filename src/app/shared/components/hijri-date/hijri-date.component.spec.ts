import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HijriDateComponent } from './hijri-date.component';

describe('HijriDateComponent', () => {
  let component: HijriDateComponent;
  let fixture: ComponentFixture<HijriDateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HijriDateComponent]
    });
    fixture = TestBed.createComponent(HijriDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
