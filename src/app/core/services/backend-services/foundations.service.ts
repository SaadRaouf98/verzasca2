import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { HttpHeaders } from '@angular/common/http';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllFoundations, Foundation, FoundationDetails } from '@core/models/foundation.model';
import { Sector } from '@core/models/sector.model';
import { SectorPayload } from '@pages/imports-exports/pages/add-transaction/add-transaction.component';

@Injectable({
  providedIn: 'root',
})
export class FoundationsService {
  readonly apiUrl = '/api/v1/foundations';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { parentId: string | null; searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData, selectedProperties);

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;

    url += `["parentId", "=",  ${
      filtersData.parentId ? '"' + filtersData.parentId + '"' : filtersData.parentId
    }]`;
    isFirstFilter = false;

    if (filtersData?.searchKeyword) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getFoundationsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { parentId: string | null; searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    skipLoader?: boolean
  ): Observable<AllFoundations> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;

    if (skipLoader === true) {
      const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
      return this.apiService.get(url, false, headers);
    }

    return this.apiService.get(url);
  }

  getSectorsByFoundationsId(
    foundationId: string,
    skipLoader: boolean = false
  ): Observable<SectorPayload> {
    let url = `${this.apiUrl}/${foundationId}/sector`;

    if (skipLoader) {
      const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
      return this.apiService.get(url, false, headers);
    }

    return this.apiService.get(url);
  }

  getFoundationById(id: string): Observable<FoundationDetails> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addFoundation(data: Foundation): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateFoundation(data: Foundation): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteFoundation(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
