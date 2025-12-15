import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSettingsComponent } from './application-settings.component';

describe('ApplicationSettingsComponent', () => {
  let component: ApplicationSettingsComponent;
  let fixture: ComponentFixture<ApplicationSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationSettingsComponent]
    });
    fixture = TestBed.createComponent(ApplicationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
