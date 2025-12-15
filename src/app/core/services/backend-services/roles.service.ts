import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { AllRoles, DetailedRole } from '@core/models/role.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  readonly apiUrl = '/api/v1/roles';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData);

    if (filtersData?.searchKeyword) {
      url += `&Filter=[["name", "contains", "${filtersData.searchKeyword}"]]`;
    }

    return url;
  }

  getRolesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllRoles> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;
    return this.apiService.get(url);
  }

  getRoleById(id: string): Observable<DetailedRole> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  updateRole(id: string, data: string[]): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${id}`, data);
  }

  asyncRoles(data: unknown): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/asynchronization`, data);
  }
}
