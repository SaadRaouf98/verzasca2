import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HisExcellencyRelatedDepartmentsListComponent } from './his-excellency-related-departments-list.component';

describe('HisExcellencyRelatedDepartmentsListComponent', () => {
  let component: HisExcellencyRelatedDepartmentsListComponent;
  let fixture: ComponentFixture<HisExcellencyRelatedDepartmentsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HisExcellencyRelatedDepartmentsListComponent]
    });
    fixture = TestBed.createComponent(HisExcellencyRelatedDepartmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
