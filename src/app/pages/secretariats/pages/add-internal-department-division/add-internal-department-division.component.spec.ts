import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternalDepartmentDivisionComponent } from './add-internal-department-division.component';

describe('AddInternalDepartmentDivisionComponent', () => {
  let component: AddInternalDepartmentDivisionComponent;
  let fixture: ComponentFixture<AddInternalDepartmentDivisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddInternalDepartmentDivisionComponent]
    });
    fixture = TestBed.createComponent(AddInternalDepartmentDivisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
