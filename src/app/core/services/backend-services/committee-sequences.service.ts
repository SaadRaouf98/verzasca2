import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Entity, AllEntities } from '@core/models/entity.model';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllCommitteeSequences,
  CommitteeSequence,
  CommitteeSequenceCommand,
} from '@core/models/committee-sequence.model';

@Injectable({
  providedIn: 'root',
})
export class CommitteeSequencesService {
  readonly apiUrl = '/api/v1/committeesequences';

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

  getCommitteeSequencesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllCommitteeSequences> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getCommitteeSequenceById(id: string): Observable<CommitteeSequence> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addCommitteeSequence(data: CommitteeSequenceCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateCommitteeSequence(data: CommitteeSequenceCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteCommitteeSequence(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  resetCommitteeSequence(id: string): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${id}/reset`, {});
  }
}
