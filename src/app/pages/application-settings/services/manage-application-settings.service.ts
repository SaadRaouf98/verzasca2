import { Injectable } from '@angular/core';
import { NotificationCategoriesService } from '@core/services/backend-services/notification-categories.service';
import { NotificationPreferencesService } from '@core/services/backend-services/notification-preferences.service';
import { UsersService } from '@core/services/backend-services/users.service';
import { IosVersionsService } from '@core/services/backend-services/ios-versions.service';

@Injectable({
  providedIn: 'root',
})
export class ManageApplicationSettingsService {
  constructor(
    public notificationPreferencesService: NotificationPreferencesService,
    public usersService: UsersService,
    public notificationCategoriesService: NotificationCategoriesService,
    public IosVersionsService: IosVersionsService
  ) {}
}
