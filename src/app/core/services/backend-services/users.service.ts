import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import {
  AllUsers,
  DetailedUser,
  UserPermissions,
} from '@core/models/user.model';
import { Observable } from 'rxjs';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  readonly apiUrl = '/api/v1/users';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; userId?: string },
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
      url += `["name", "contains", "${filtersData.searchKeyword}"], "or", ["userName", "contains", "${filtersData.searchKeyword}"], "or", ["phoneNumber", "contains", "${filtersData.searchKeyword}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.userId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["id", "=", "${filtersData.userId}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getUsersList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; userId?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllUsers> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getUsersListOnly(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; userId?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllUsers> {
    let url = `${this.apiUrl}/users/?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getUserLogs(userId: string) {
    return this.apiService.get(`${this.apiUrl}/${userId}/activities`);
  }

  getUsersListToInternalAssignment(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllUsers> {
    let url = `${this.apiUrl}/internal-assignment?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getCurrentUser(): Observable<DetailedUser> {
    return this.apiService.get(`${this.apiUrl}/current`);
  }

  syncUsers(): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/asynchronization`, {});
  }

  getUserPermissionsById(userId: string): Observable<UserPermissions> {
    return this.apiService.get(`${this.apiUrl}/${userId}/permissions`);
  }

  updateUserPermissions(
    userId: string,
    permissions: string[]
  ): Observable<null> {
    return this.apiService.put(
      `${this.apiUrl}/${userId}/permissions`,
      permissions
    );
  }
}
