import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemManagementPage } from './system-management.page';

describe('SystemManagementPage', () => {
  let component: SystemManagementPage;
  let fixture: ComponentFixture<SystemManagementPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemManagementPage],
    });
    fixture = TestBed.createComponent(SystemManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
