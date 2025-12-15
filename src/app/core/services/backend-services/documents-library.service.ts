import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { AllDocumentsLibrary } from '@core/models/documents-library.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class DocumentsLibraryService {
  readonly apiUrl = '/api/v1/documentslibrary';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { path: string; uniqueId: string },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData);

    if (filtersData?.uniqueId) {
      url += `&UniqueId=${filtersData.uniqueId}`;
    }

    if (filtersData?.path) {
      url += `&Path=${filtersData.path.replaceAll('&', '_Replace_')}`;
    }

    return url;
  }

  getDocumentsLibraryList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { path: string; uniqueId: string },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllDocumentsLibrary> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      { path: filtersData?.path, uniqueId: filtersData?.uniqueId },
      sortData
    )}`;
    return this.apiService.get(url);
  }

  syncDocumentsLibrary(directoryPath: string): Observable<boolean> {
    return this.apiService.put(
      `${this.apiUrl}/asynchronization`,
      directoryPath
    );
  }

  downloadFile(
    path: string,
    uniqueId: string,
    fileName: string
  ): Observable<any> {
    return this.apiService.getAndDownloadFile(
      `${this.apiUrl}/files?path=${path}&uniqueId=${uniqueId}`,
      fileName
    );
  }

  viewFile(path: string, uniqueId: string): Observable<any> {
    /* return this.apiService.getFile(
      `${this.apiUrl}/files?path=${path.replaceAll('&', '_Replace_')}&uniqueId=${uniqueId}`
    ); */

    return this.apiService.viewPDF(
      `${this.apiUrl}/files?path=${path.replaceAll(
        '&',
        '_Replace_'
      )}&uniqueId=${uniqueId}`
    );
  }

  getFile(path: string, uniqueId: string): Observable<Blob> {
    return this.apiService.getFile(
      `${this.apiUrl}/files?path=${path.replaceAll(
        '&',
        '_Replace_'
      )}&uniqueId=${uniqueId}`
    );
  }
}
