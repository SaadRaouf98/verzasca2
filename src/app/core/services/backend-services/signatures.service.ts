import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllSignatures,
  DetailedSignature,
  SignatureCommand,
} from '@core/models/signature.model';
import { SignatureStatus } from '@core/enums/signature-status.enum';

@Injectable({
  providedIn: 'root',
})
export class SignaturesService {
  readonly apiUrl = '/api/v1/signatures';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      committeeId?: string;
      status?: SignatureStatus;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    let filters = [];

    if (filtersData?.searchKeyword) {
      filters.push(
        `[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`
      );
    }

    if (filtersData?.committeeId) {
      filters.push(`["committee.id", "=", "${filtersData.committeeId}"]`);
    }

    if (filtersData?.status) {
      filters.push(`["status", "=", "${filtersData.status}"]`);
    }
    filters.join(`, "and", `);
    if (filtersData && Object.keys(filtersData).length) {
      url += `&Filter=[${filters.join(`, "and", `)}]`;
    }

    return url;
  }

  getSignaturesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      committeeId?: string;
      status?: SignatureStatus;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllSignatures> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getSignatureById(id: string): Observable<DetailedSignature> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addSignature(data: SignatureCommand): Observable<string> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateSignature(data: SignatureCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteSignature(id: string): Observable<null> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  deleteSignatureSetting(id: string): Observable<null> {
    return this.apiService.delete(`${this.apiUrl}/${id}/settings`);
  }
}

