import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import { AllRecords } from '@core/models/record.model';
import { AllNotes, NotesFiltersForm } from '@core/models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  readonly apiUrl = '/api/v1/notes';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: NotesFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData);

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;
    if (filtersData?.searchKeyword) {
      url += `[["exportNumber", "contains", "${encodeURIComponent(
        filtersData.searchKeyword
      )}"] , 'or', ["title", "contains", "${encodeURIComponent(
        filtersData.searchKeyword
      )}"]  ]`;

      isFirstFilter = false;
    }

    if (filtersData?.priorityId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Priority.id", "=", "${filtersData.priorityId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.documentType) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["DocumentType", "=", "${filtersData.documentType}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.consultantId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Consultants.id", "=", "${filtersData.consultantId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.classificationId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Classification.id", "=", "${filtersData.classificationId}"]`;
      isFirstFilter = false;
    }

    /*    if (
      filtersData &&
      filtersData.isInitiated !== undefined &&
      typeof filtersData.isInitiated !== 'object'
    ) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isInitiated", "=", "${filtersData.isInitiated}"]`;
      isFirstFilter = false;
    } */

    if (
      filtersData &&
      filtersData.isSigned !== undefined &&
      typeof filtersData.isSigned !== 'object'
    ) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isSigned", "=", "${filtersData.isSigned}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.fromDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["date", ">=", "${filtersData.fromDate}"]`;

      isFirstFilter = false;
    }

    if (filtersData?.toDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      url += `["date", "<=", "${filtersData.toDate}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }
return url;
  }

  getNotesList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: NotesFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllNotes> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;
    return this.apiService.get(url);
  }

  getFile(noteId: string): Observable<{ name: string; file: string }> {
    return this.apiService.get(`${this.apiUrl}/${noteId}/document`);
  }

  getNote(noteId: string): Observable<any> {
    return this.apiService.get(`${this.apiUrl}/${noteId}`);
  }

  getSignatureUsers(noteId: string): Observable<any> {
    return this.apiService.get(`${this.apiUrl}/${noteId}/signature-users`);
  }

  signaturePhoneApproval(
    noteId: string,
    body: { userId: string; comment: string }
  ): Observable<any> {
    return this.apiService.put(
      `${this.apiUrl}/${noteId}/signature-phone-approval`,
      {
        ...body,
      }
    );
  }
}

