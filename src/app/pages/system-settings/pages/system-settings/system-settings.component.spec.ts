import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemSettingsPage } from './system-settings.component';

describe('SystemSettingsComponent', () => {
  let component: SystemSettingsPage;
  let fixture: ComponentFixture<SystemSettingsPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemSettingsPage],
    });
    fixture = TestBed.createComponent(SystemSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
