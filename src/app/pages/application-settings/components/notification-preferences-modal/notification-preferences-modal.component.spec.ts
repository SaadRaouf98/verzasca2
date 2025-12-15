import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPreferencesModalComponent } from './notification-preferences-modal.component';

describe('NotificationPreferencesModalComponent', () => {
  let component: NotificationPreferencesModalComponent;
  let fixture: ComponentFixture<NotificationPreferencesModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationPreferencesModalComponent]
    });
    fixture = TestBed.createComponent(NotificationPreferencesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
