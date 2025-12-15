import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermissionsComponent } from './manage-roles.component';

describe('ManageRolesComponent', () => {
  let component: RolePermissionsComponent;
  let fixture: ComponentFixture<RolePermissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RolePermissionsComponent],
    });
    fixture = TestBed.createComponent(RolePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
