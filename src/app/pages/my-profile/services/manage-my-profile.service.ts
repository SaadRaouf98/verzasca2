import {Injectable} from '@angular/core';
import {NotificationPreferencesService} from '@core/services/backend-services/notification-preferences.service';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "@core/services/api.service";

@Injectable({
  providedIn: 'root',
})
export class ManageMyProfileService {
  readonly apiUrl = '/api/v1/';

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    public notificationPreferencesService: NotificationPreferencesService
  ) {
  }

  getUserInfo() {
    return this.apiService.get(`${this.apiUrl}users/info`);
  }

  getUserStatistics(range: {
    fromDate: string;
    toDate: string;
  }) {
    return this.apiService.get(`${this.apiUrl}statistics/employees/actions?startDate=${range.fromDate}&endDate=${range.toDate}`);
  }
}
