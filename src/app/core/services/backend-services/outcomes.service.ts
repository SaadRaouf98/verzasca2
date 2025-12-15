import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Entity, AllEntities } from '@core/models/entity.model';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
@Injectable({
  providedIn: 'root',
})
export class OutcomesService {
  readonly apiUrl = '/api/v1/outcomes';

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
      url += `&Filter=[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
    }
    return url;
  }

  getOutcomesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllEntities> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getOutcomeById(id: string): Observable<Entity> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addOutcome(data: Entity): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateOutcome(data: Entity): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteOutcome(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
