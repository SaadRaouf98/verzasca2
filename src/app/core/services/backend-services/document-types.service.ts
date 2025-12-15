import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllDocumentTypes, Documenttype } from '@core/models/document-type.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypesService {
  readonly apiUrl = '/api/v1/documenttypes';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData, selectedProperties);
    if (filtersData?.searchKeyword) {
      url += `&Filter=[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
    }
    return url;
  }

  getDocumentTypesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllDocumentTypes> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getDocumentTypeById(id: string): Observable<Documenttype> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addDocumentType(data: Documenttype): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateDocumentType(data: Documenttype): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteDocumentType(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
