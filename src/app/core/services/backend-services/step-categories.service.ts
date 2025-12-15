import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Entity, AllEntities } from '@core/models/entity.model';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class StepCategoriesService {
  readonly apiUrl = '/api/v1/stepcategories';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    return buildUrlQueryPaginationSortSelectParams(queryData, sortData);
  }

  getStepCategoriesList(
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllEntities> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(queryData, sortData)}`;
    return this.apiService.get(url);
  }

  getStepCategoryById(id: string): Observable<Entity> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addStepCategory(data: Entity): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateStepCategory(data: Entity): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteStepCategory(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
