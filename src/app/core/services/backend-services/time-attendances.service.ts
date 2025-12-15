import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllTimeAttendance,
  TimeAttendanceSummary,
} from '@core/models/time-attendant.model';

@Injectable({
  providedIn: 'root',
})
export class TimeAttendancesService {
  readonly apiUrl = '/api/v1/timeattendances';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData?: { pageSize: number; pageIndex: number },
    filtersData?: { startDate: string; endDate: string }
  ): string {
    let url = '';

    if (queryData) {
      url += buildUrlQueryPaginationSortSelectParams(queryData);
    }

    if (filtersData?.startDate) {
      url += `&StartDate=${filtersData.startDate}`;
    }

    if (filtersData?.endDate) {
      url += `&EndDate=${filtersData.endDate}`;
    }

    return url;
  }

  getTimeAttendanceList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { startDate: string; endDate: string }
  ): Observable<AllTimeAttendance> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData
    )}`;
    return this.apiService.get(url);
  }

  getTimeAttendanceSummary(filtersData?: {
    startDate: string;
    endDate: string;
  }): Observable<TimeAttendanceSummary> {
    let url = `${this.apiUrl}/summary?${this.buildUrlQueryParams(
      undefined,
      filtersData
    )}`;
    return this.apiService.get(url);
  }

  syncAttendance(): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, {});
  }
}
