import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalProgressSpinnerComponent } from './global-progress-spinner.component';

describe('GlobalProgressSpinnerComponent', () => {
  let component: GlobalProgressSpinnerComponent;
  let fixture: ComponentFixture<GlobalProgressSpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalProgressSpinnerComponent]
    });
    fixture = TestBed.createComponent(GlobalProgressSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
