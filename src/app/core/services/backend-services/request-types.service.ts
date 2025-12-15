import { Injectable } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllRequestTypes,
  DetailedRequestType,
  RequestTypeCommand,
} from '@core/models/request-type.model';

@Injectable({
  providedIn: 'root',
})
export class RequestTypesService {
  readonly apiUrl = '/api/v1/requesttypes';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      classificationId?: string;
      isTransaction?: boolean;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    if (filtersData?.classificationId) {
      url += `&classificationId=${filtersData.classificationId}`;
    }

    let filters: string[] = [];

    if (filtersData?.searchKeyword) {
      filters.push(`["title", "contains", "${filtersData.searchKeyword}"]`);
    }

    if (filtersData?.isTransaction !== undefined) {
      filters.push(`["isTransaction", "=", "${filtersData?.isTransaction}"]`);
    }

    if (filters.length) {
      url += `&Filter=[${filters.join(",'and',")}]`;
    }

    return url;
  }

  getRequestTypesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      classificationId?: string;
      isTransaction?: boolean;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequestTypes> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getRequestTypeById(id: string): Observable<DetailedRequestType> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addRequestType(data: RequestTypeCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateRequestType(data: RequestTypeCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteRequestType(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
