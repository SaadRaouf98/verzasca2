import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRelatedDepartmentComponent } from './add-related-department.component';

describe('AddRelatedDepartmentComponent', () => {
  let component: AddRelatedDepartmentComponent;
  let fixture: ComponentFixture<AddRelatedDepartmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddRelatedDepartmentComponent]
    });
    fixture = TestBed.createComponent(AddRelatedDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
