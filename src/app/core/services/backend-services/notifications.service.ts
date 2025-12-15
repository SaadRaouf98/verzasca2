import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllNotifications } from '@core/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  readonly apiUrl = '/api/v1/notifications';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { seen?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    if (
      filtersData &&
      filtersData.seen !== null &&
      filtersData.seen !== undefined
    ) {
      url += `&Filter=["Seen", "=", ${filtersData.seen}]`;
    }
    return url;
  }

  getNotificationsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { seen?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllNotifications> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  updateNotificationItemStatus(
    notificationId: string,
    seen: boolean
  ): Observable<null> {
    return this.apiService.put(
      `${this.apiUrl}/${notificationId}?seen=${seen}`,
      {}
    );
  }

  readAllNotifications(): Observable<void> {
    return this.apiService.put(`${this.apiUrl}/read-all`, {});
  }

  deleteAllNotifications(): Observable<void> {
    return this.apiService.delete(`${this.apiUrl}`);
  }
}
