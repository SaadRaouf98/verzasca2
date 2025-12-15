import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationSettingsRoutingModule } from './application-settings-routing.module';
import { ApplicationSettingsComponent } from './pages/application-settings/application-settings.component';
import { NotificationUsersPreferencesListComponent } from './pages/notification-users-preferences/notification-users-preferences-list.component';
import { SharedModule } from '@shared/shared.module';
import { NotificationPreferencesModalComponent } from './components/notification-preferences-modal/notification-preferences-modal.component';
import { AppNotificationsComponent } from './pages/app-notifications/app-notifications.component';
import { AppVersionsListComponent } from './pages/app-versions-list/app-versions-list.component';
import { AddVersionComponent } from './pages/add-version/add-version.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';

@NgModule({
  declarations: [
    ApplicationSettingsComponent,
    NotificationUsersPreferencesListComponent,
    NotificationPreferencesModalComponent,
    AppNotificationsComponent,
    AppVersionsListComponent,
    AddVersionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApplicationSettingsRoutingModule,
    MultiSelectComponent,
    SingleSelectComponent,
  ],
})
export class ApplicationSettingsModule {}
