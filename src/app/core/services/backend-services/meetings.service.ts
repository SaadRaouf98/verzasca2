import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';

import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllMeetings,
  AllScheduledRequestContainers,
  CalendarDayEvents,
  CloseMeetingCommand,
  ConfirmMeetingAttendanceCommand,
  MeetingCommand,
  MeetingDetails,
} from '@core/models/meeting.model';
import { removeFirstAndLastChar } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class MeetingsService {
  readonly apiUrl = '/api/v1/meetings';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      fromDate?: string;
      toDate?: string;
      hijriFromDate?: string;
      hijriToDate?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;
    if (filtersData?.searchKeyword) {
      url += `["title", "contains", "${filtersData.searchKeyword}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.fromDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["meetingDateTime", ">=", "${filtersData.fromDate}"]`;

      isFirstFilter = false;
    }

    if (filtersData?.toDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["meetingDateTime", "<=", "${filtersData.toDate}"]`;

      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }
    return url;
  }

  getMeetingsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      fromDate?: string;
      toDate?: string;
      hijriFromDate?: string;
      hijriToDate?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllMeetings> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getMeetingById(id: string): Observable<MeetingDetails> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addMeeting(data: MeetingCommand): Observable<string> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateMeeting(data: MeetingCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteMeeting(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  private buildScheduledRequestsUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      committeeId?: string;
      isScheduled?: boolean;
      searchKeyword?: string;
    }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData);

    if (filtersData?.searchKeyword) {
      url += `&searchText=${filtersData.searchKeyword}`;
    }

    if (filtersData?.committeeId) {
      url += `&committeeId=${filtersData.committeeId}`;
    }

    url += `&isScheduled=${filtersData?.isScheduled ? 'true' : 'false'}`;

    return url;
  }

  getScheduledRequestContainersList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      committeeId?: string;
      isScheduled?: boolean;
      searchKeyword?: string;
    }
  ): Observable<AllScheduledRequestContainers> {
    let url = `${
      this.apiUrl
    }/containers?${this.buildScheduledRequestsUrlQueryParams(
      queryData,
      filtersData
    )}`;

    return this.apiService.get(url);
  }

  buildQueryParams(params: Record<string, any>): string {
    return Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const encodedValue =
          typeof value === 'object'
            ? encodeURIComponent(JSON.stringify(value))
            : encodeURIComponent(value);
        return `${key}=${encodedValue}`;
      })
      .join('&');
  }

  getActiveNewMeetings(query: any): Observable<CalendarDayEvents[]> {
    const queryString = this.buildQueryParams({
      Filter: query.Filter,
      Take: query.Take,
      RequireTotalCount: query.RequireTotalCount,
    });

    return this.apiService.get(
      `/active?${queryString}`
    );
  }

  getActiveMeetings(
    startDate?: string,
    endDate?: string
  ): Observable<CalendarDayEvents[]> {
    let url = `${this.apiUrl}/active?`;
    if (startDate) {
      url += `StartDate=${startDate}`;
    }

    if (endDate) {
      url += `&EndDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  closeMeeting(data: CloseMeetingCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/attendance`, data);
  }

  confirmMeetingAttendance(
    data: ConfirmMeetingAttendanceCommand
  ): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/confirm-attendance`, data);
  }
}

