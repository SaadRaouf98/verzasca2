import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllConsultantGroups,
  ConsultantGroupCommand,
  ConsultantGroupDetails,
} from '@core/models/consultant-group.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultantGroupsService {
  readonly apiUrl = '/api/v1/consultantgroups';

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
      url += `&Filter=["title", "contains", "${filtersData.searchKeyword}"]`;
    }
    return url;
  }

  getConsultantGroupsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllConsultantGroups> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getConsultantGroupById(id: string): Observable<ConsultantGroupDetails> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addConsultantGroup(data: ConsultantGroupCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateConsultantGroup(data: ConsultantGroupCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteConsultantGroup(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
