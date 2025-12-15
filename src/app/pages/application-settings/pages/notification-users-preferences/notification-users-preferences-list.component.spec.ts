import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationUsersPreferencesListComponent } from './notification-users-preferences-list.component';

describe('NotificationUsersPreferencesComponent', () => {
  let component: NotificationUsersPreferencesListComponent;
  let fixture: ComponentFixture<NotificationUsersPreferencesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationUsersPreferencesListComponent],
    });
    fixture = TestBed.createComponent(
      NotificationUsersPreferencesListComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
