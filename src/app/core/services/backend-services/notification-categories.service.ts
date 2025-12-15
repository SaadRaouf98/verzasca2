import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  AllNotificationsCategories,
  UpdateNotificationsCategoryUsersCommand,
} from '@core/models/notifications-category.model';
import { NotificationCategory } from '@core/enums/notification-category.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationCategoriesService {
  readonly apiUrl = '/api/v1/notification-categories';

  constructor(private apiService: ApiService) {}

  getCategoryUsers(
    category: NotificationCategory
  ): Observable<AllNotificationsCategories> {
    let url = `${this.apiUrl}/${category}`;
    return this.apiService.get(url);
  }

  updateCategoryUsers(
    data: UpdateNotificationsCategoryUsersCommand
  ): Observable<null> {
    let url = `${this.apiUrl}`;
    return this.apiService.put(url, data);
  }
}
