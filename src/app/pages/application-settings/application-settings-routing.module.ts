import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationUsersPreferencesListComponent } from './pages/notification-users-preferences/notification-users-preferences-list.component';
import { ApplicationSettingsComponent } from './pages/application-settings/application-settings.component';
import { AppNotificationsComponent } from './pages/app-notifications/app-notifications.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AppVersionsListComponent } from './pages/app-versions-list/app-versions-list.component';
import { AddVersionComponent } from './pages/add-version/add-version.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationSettingsComponent,
  },
  {
    path: 'notifications-preferences',
    component: NotificationUsersPreferencesListComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ManageNotificationPreferences,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'app-notifications',
    component: AppNotificationsComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ManageNotificationCategories,
        redirectTo: '/home',
      },
    },
  },

  {
    path: 'app-versions-list',
    component: AppVersionsListComponent,
  },

  {
    path: 'app-add-version',
    component: AddVersionComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.AddNewIosVersion,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationSettingsRoutingModule {}
