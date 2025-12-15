import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllPriorities, Priority } from '@core/models/priority.model';

@Injectable({
  providedIn: 'root',
})
export class PrioritiesService {
  readonly apiUrl = '/api/v1/priorities';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    return buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );
  }

  getPrioritiesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllPriorities> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getPriorityById(id: string): Observable<Priority> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addPriority(data: Priority): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updatePriority(data: Priority): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deletePriority(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
