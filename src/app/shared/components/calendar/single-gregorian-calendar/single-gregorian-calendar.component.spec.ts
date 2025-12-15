import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleGregorianCalendarComponent } from './single-gregorian-calendar.component';

describe('SingleGregorianCalendarComponent', () => {
  let component: SingleGregorianCalendarComponent;
  let fixture: ComponentFixture<SingleGregorianCalendarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleGregorianCalendarComponent]
    });
    fixture = TestBed.createComponent(SingleGregorianCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
