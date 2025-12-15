import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';

import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AddIOSVersionCommand,
  AllIOSVersions,
} from '@core/models/IOS-version.model';

@Injectable({
  providedIn: 'root',
})
export class IosVersionsService {
  readonly apiUrl = '/api/v1/iosapps/versions';

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

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;

    if (filtersData?.searchKeyword) {
      url += `["version", "contains", "${filtersData.searchKeyword}"], "or", ["link", "contains", "${filtersData.searchKeyword}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getIOSVersionsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllIOSVersions> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  addIOSVersion(data: AddIOSVersionCommand): Observable<string> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }
}
