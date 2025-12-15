import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllExportedAttachmentTypes,
  ExportedAttachmentType,
  ExportedAttachmentTypeCommand,
} from '@core/models/exported-attachment-type.model';

@Injectable({
  providedIn: 'root',
})
export class ExportedAttachmentTypesService {
  readonly apiUrl = '/api/v1/exportedattachmenttypes';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    return buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );
  }

  getExportedAttachmentTypesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchKeyword?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllExportedAttachmentTypes> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getExportedAttachmentTypeById(
    id: string
  ): Observable<ExportedAttachmentType> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addExportedAttachmentType(
    data: ExportedAttachmentTypeCommand
  ): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateExportedAttachmentType(
    data: ExportedAttachmentTypeCommand
  ): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteExportedAttachmentType(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
