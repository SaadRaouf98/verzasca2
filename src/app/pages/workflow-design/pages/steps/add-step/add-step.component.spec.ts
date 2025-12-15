import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStepComponent } from './add-step.component';

describe('AddStepComponent', () => {
  let component: AddStepComponent;
  let fixture: ComponentFixture<AddStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddStepComponent]
    });
    fixture = TestBed.createComponent(AddStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
