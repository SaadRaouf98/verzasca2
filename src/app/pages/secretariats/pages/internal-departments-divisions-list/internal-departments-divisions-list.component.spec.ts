import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalDepartmentsDivisionsListComponent } from './internal-departments-divisions-list.component';

describe('InternalDepartmentsDivisionsListComponent', () => {
  let component: InternalDepartmentsDivisionsListComponent;
  let fixture: ComponentFixture<InternalDepartmentsDivisionsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternalDepartmentsDivisionsListComponent],
    });
    fixture = TestBed.createComponent(
      InternalDepartmentsDivisionsListComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
