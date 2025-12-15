import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Entity, AllEntities } from '@core/models/entity.model';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllSchemas, Schema, SchemaCommand } from '@core/models/schema.model';

@Injectable({
  providedIn: 'root',
})
export class SchemasService {
  readonly apiUrl = '/api/v1/schemas';

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
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
      isFirstFilter = false;
    }

    if (filtersData?.isActive) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isActive", "=", "${filtersData.isActive}"]`;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getSchemasList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string; isActive?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllSchemas> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getSchemaById(id: string): Observable<Schema> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addSchema(data: SchemaCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateSchema(data: SchemaCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteSchema(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
