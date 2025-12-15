import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Entity, AllEntities } from '@core/models/entity.model';
import { SortDirection } from '@angular/material/sort';
import {
  AllClassifications,
  Classification,
  ClassificationCommand,
  ClassificationDetails,
} from '@core/models/classification.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class ClassificationsService {
  readonly apiUrl = '/api/v1/classifications';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; isActive?: boolean },
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
      url += `[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
      isFirstFilter = false;
    }

    if (filtersData?.isActive) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isActive", "=", "${filtersData.isActive}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getClassificationsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; isActive?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllClassifications> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getClassificationById(id: string): Observable<ClassificationDetails> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }
  getClassificationUsersById(id: string): Observable<any> {
    let url = `${this.apiUrl}/${id}/users`;
    return this.apiService.get(url);
  }
  addClassification(data: ClassificationCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateClassification(data: ClassificationCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteClassification(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
