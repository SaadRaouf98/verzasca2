import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStepCategoryComponent } from './add-step-category.component';

describe('AddStepCategoryComponent', () => {
  let component: AddStepCategoryComponent;
  let fixture: ComponentFixture<AddStepCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddStepCategoryComponent]
    });
    fixture = TestBed.createComponent(AddStepCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
