import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllNotificationPreferences,
  MyNotificationPreference,
  UpdateMyNotificationPreferenceCommand,
  UpdateNotificationPreferenceCommand,
} from '@core/models/notification-preference.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationPreferencesService {
  readonly apiUrl = '/api/v1/notification-preferences';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    if (filtersData?.searchKeyword) {
      url += `&Filter=["name", "contains", "${filtersData.searchKeyword}"]`;
    }

    return url;
  }

  getNotificationsUsersPreferencesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllNotificationPreferences> {
    let url = `${this.apiUrl}/users?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  updateNotificationUserPreference(
    data: UpdateNotificationPreferenceCommand[]
  ): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/users`, {
      users: data,
    });
  }

  ////////////////Notification preferences for Loggedin User /////////////////////
  getMyNotificationsPreferences(): Observable<MyNotificationPreference> {
    let url = `${this.apiUrl}`;
    return this.apiService.get(url);
  }

  updateMyNotificationPreference(
    data: UpdateMyNotificationPreferenceCommand
  ): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }
}
