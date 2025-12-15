import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllRecords,
  ExportSignature,
  RecordDetails,
  RecordMember,
  RecordsFiltersForm,
  RecordsFiltersForm2,
} from '@core/models/record.model';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { formatDateToYYYYMMDD } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class RecordsService {
  readonly apiUrl = '/api/v1/records';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: RecordsFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData);

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;

    if (filtersData.searchKeyword) {
      url += `[["exportNumber", "=", "${encodeURIComponent(
        filtersData.searchKeyword
      )}"] , 'or', ["title", "contains", "${encodeURIComponent(
        filtersData.searchKeyword
      )}"] , 'or', ["requestContainer.title", "contains", "${encodeURIComponent(
        filtersData.searchKeyword
      )}"] ]`;
      isFirstFilter = false;
    }

    if (filtersData.committeeIds && filtersData.committeeIds.length) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      if (filtersData.committeeIds.length === 1) {
        url += `["committee.id", "=", "${filtersData.committeeIds[0]}"]`;
      } else if (filtersData.committeeIds.length === 2) {
        url += `[["committee.id", "=", "${filtersData.committeeIds[0]}"], 'or', ["committee.id", "=", "${filtersData.committeeIds[1]}"]]`;
      } else {
        url += `[["committee.id", "=", "${filtersData.committeeIds[0]}"], 'or', ["committee.id", "=", "${filtersData.committeeIds[1]}"] , 'or', ["committee.id", "=", "${filtersData.committeeIds[2]}"]]`;
      }
      isFirstFilter = false;
    }

    if (filtersData.priorityId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["priority.id", "=", "${filtersData.priorityId}"]`;
      isFirstFilter = false;
    }

    if (filtersData.classificationId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["classification.id", "=", "${filtersData.classificationId}"]`;
      isFirstFilter = false;
    }

    if (
      filtersData.isInitiated !== undefined &&
      filtersData.isInitiated !== null
    ) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isInitiated", "=", "${filtersData.isInitiated}"]`;
      isFirstFilter = false;
    }

    if (
      filtersData.isExported !== undefined &&
      filtersData.isExported !== null
    ) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isExported", "=", "${filtersData.isExported}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getRecordsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: RecordsFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllRecords> {
    let url = `${this.apiUrl}/with-members?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;
    return this.apiService.get(url);
  }

  getRecordMembers(recordId: string): Observable<RecordMember[]> {
    return this.apiService.get(`${this.apiUrl}/${recordId}/committee-members`);
  }

  getExportSignatures(recordId: string): Observable<ExportSignature> {
    return this.apiService.get(`${this.apiUrl}/${recordId}/signature-format`);
  }

  getRecordDetails(recordId: string): Observable<RecordDetails> {
    return this.apiService.get(`${this.apiUrl}/${recordId}`);
  }

  getRecordFile(
    recordId: string
  ): Observable<{ name: string; file: string; contentType: string }> {
    return this.apiService.get(`${this.apiUrl}/${recordId}/document`);
  }

  deleteRecordAction(recordId: string, memberId: string): Observable<null> {
    return this.apiService.delete(
      `${this.apiUrl}/${recordId}/members/${memberId}/actions`
    );
  }

  takeActionViaPhone(
    recordId: string,
    memberId: string,
    actionType: ExportableDocumentActionType,
    comment: string | null
  ): Observable<null> {
    return this.apiService.post(
      `${this.apiUrl}/${recordId}/members/${memberId}/actions`,
      {
        actionType,
        comment,
      }
    );
  }

  exportExcel(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: RecordsFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<Blob> {
    let url = `${this.apiUrl}/export?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;

    const fileName = `${formatDateToYYYYMMDD(new Date())}.xlsx`;
    return this.apiService.getAndDownloadExcelFile(url, fileName);
  }
}

