import {Injectable} from '@angular/core';
import {Observable, filter} from 'rxjs';
import {ApiService} from '../api.service';
import {SortDirection} from '@angular/material/sort';
import {buildUrlQueryPaginationSortSelectParams} from '@core/helpers/build-url-query-params';
import {RegularReportBoardType} from '@core/enums/regular-report-board-type.enum';
import {
  AddRegularReportCommand,
  AllRegularReports, Report,
} from '@core/models/regular-report.model';

@Injectable({
  providedIn: 'root',
})
export class RegularReportsService {
  readonly apiUrl = '/api/v1/regularreports';
  readonly imageApiUrl = '/api/wopi/files/by-path?path=';

  constructor(private apiService: ApiService) {
  }

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {
      type: RegularReportBoardType;
      parentId?: string | null;
      searchKeyword?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );
    if(filtersData.type){
   url += `&type=${filtersData.type}`;
    }
 
    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;
    filtersData.parentId == undefined ? filtersData.parentId = null : '';
    if (filtersData.parentId || filtersData.parentId == null) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      filtersData.parentId == null ? url += `["parentId", "=",${filtersData.parentId}]` : url += `["parentId", "=", "${filtersData.parentId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.searchKeyword) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["title", "contains", "${filtersData.searchKeyword}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getReportDetails(reportId: string): Observable<Report> {
    return this.apiService.get(`${this.apiUrl}/${reportId}`);
  }
    getReportPath(reportId: string): Observable<string[]> {
    return this.apiService.get(`${this.apiUrl}/${reportId}/path`);
  }
    getThumbnail(path: string): Observable<Blob> {
    return this.apiService.getFile(`${this.imageApiUrl}${path}`);
  }

  getRegularReportsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    customHeaders?: any
  ): Observable<AllRegularReports> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url, false, customHeaders);
  }

  viewReportByPath(reportId: string): Observable<Blob> {
    return this.apiService.getFile(
      `${this.apiUrl}/${reportId}/file`
    );
  }

  getReportLogs(reportId: string) {
    return this.apiService.get(`${this.apiUrl}/${reportId}/logs`);
  }

  getFile(path: string): Observable<Blob> {
    return this.apiService.getFile(
      `${this.apiUrl}/files?path=${path.replaceAll('&', '_Replace_')}`
    );
  }

  downloadReport(reportName: string, reportId: string) {
    return this.apiService.getAndDownloadFile(
      `${this.apiUrl}/${reportId}/file`,
      reportName
    );
  }
   deleteReport( reportId: string) {
    return this.apiService.delete(
      `${this.apiUrl}/${reportId}`,
      
    );
  }

  addRegularReport(report: AddRegularReportCommand) {
    return this.apiService.post(
      this.apiUrl,
    report
    );
  }
  updateRegularReport(id: string, report: AddRegularReportCommand) {
    return this.apiService.put(
      this.apiUrl + '/' + id,
     report
    );
  }
  moveRegularReportFolder(id: string, folderID: string) {
    return this.apiService.put(
      `${this.apiUrl}/${id}/move`,
     
     folderID
    );
  }

  toggleActiveStatus(reportId: string): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${reportId}/activation`, {});
  }

  syncRegularReports(): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/asynchronization`, {});
  }

  getBreadCrumb(id: string): Observable<any> {
    return this.apiService.get(`${this.apiUrl}/${id}/path`);
  }

  private getReportFormData(report: AddRegularReportCommand): FormData {
    const formData: FormData = new FormData();
    formData.append('Title', report.title);
    formData.append('BoardType', report.boardType + '');

    if (report.parentId) {
      formData.append('ParentId', report.parentId);
    }

    if (report.fileId !== null) {
      formData.append('ReportFile', report.fileId);
    }

    if (report.thumbnailId) {
      formData.append('ThumbnailImage', report.thumbnailId);
    }

    if (report.committeesIds && report.committeesIds.length > 0) {
      report.committeesIds.forEach(c => formData.append('committeesIds', c));
    }

    return formData;
  }
}
