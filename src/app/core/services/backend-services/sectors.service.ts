import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllSectors, Sector } from '@core/models/sector.model';

@Injectable({
  providedIn: 'root',
})
export class SectorsService {
  readonly apiUrl = '/api/v1/sectors';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { parentId: string | null; searchKeyword?: string },
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

    url += `["parentId", "=",  ${
      filtersData.parentId
        ? '"' + filtersData.parentId + '"'
        : filtersData.parentId
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

  getSectorsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { parentId: string | null; searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllSectors> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getSectorById(id: string): Observable<Sector> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addSector(data: Sector): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateSector(data: Sector): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteSector(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
