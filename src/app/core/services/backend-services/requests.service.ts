import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AddRequestCommand,
  AddRelatedRequestsCommand,
  AllRelatedRequests,
  AllRequests,
  RequestDetails,
  UpdateRequestCommand,
  RequestTimeLine,
  RequestExportRecommendation,
  RequestStep,
  Attachment,
  RequestsFiltersForm,
  CommitteeApproval,
  AllImportRequests,
  AllExportRequestModel,
  User,
  AllAllowedUsers,
  // AddRequestAttachmentCommand,
} from '@core/models/request.model';
import { RequestStatus } from '@core/enums/request-status.enum';
import { RequestAction } from '@core/models/request-action.model';
import { ActionType } from '@core/enums/action-type.enum';
import { formatDateToYYYYMMDD, objectToFormData } from '@shared/helpers/helpers';
import { YesNo } from '@shared/enums/yes-no.enum';
import { DocumentExportTo } from '@core/enums/document-export-to.enum';
import { RequestAttachment } from '@core/models/request-attachment.model';
import { AllPendingRequests, PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '@env/environment';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { BarcodeNoBackgroundDetails } from '@core/models/exportable-document.model';
import { ExportStatement } from '@core/models/export-statement.model';
import { AllUsers } from '@core/models/user.model';
import { Transaction } from '@core/models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  readonly apiUrl = '/api/v1/requests';
  baseUrl = environment.apiUrl;

  constructor(private apiService: ApiService, private authService: AuthService) {}

  // build a foundation filter segment. Caller should compute hasOtherFilters and pass it.
  private getFoundationFilterSegment(filtersData: any, hasOtherFilters: boolean): string {
    const f = filtersData.foundationId ?? filtersData.foundation?.id ?? filtersData.foundation;

    if (!f) return null;

    if (Array.isArray(f)) {
      if (f.length === 1) {
        return `["foundation.id", "=", "${f[0]}"]`;
      }

      if (f.length > 1) {
        if (hasOtherFilters) {
          // grouped OR sub-expression
          return (
            '[' +
            f
              .map((id: any, i: number) =>
                i === 0 ? `[["foundation.id","=","${id}"]` : `,"or",["foundation.id","=","${id}"]`
              )
              .join('')
              .replace('[[', '[') +
            ']'
          );
        }
        return f
          .map((id: any, i: number) =>
            i === 0 ? `["foundation.id","=","${id}"]` : `,"or",["foundation.id","=","${id}"]`
          )
          .join('');
      }
    }

    // Handle single string value
    if (typeof f === 'string' && f.trim()) {
      return `["foundation.id", "=", "${f}"]`;
    }

    return null;
  }
  private getRequestTypeFilterSegment(filtersData: any, hasOtherFilters: boolean): string {
    const f = filtersData.requestTypeId;

    if (!f) return null;

    if (Array.isArray(f)) {
      if (f.length === 1) {
        return `["RequestType.id", "=", "${f[0]}"]`;
      }

      if (f.length > 1) {
        if (hasOtherFilters) {
          // grouped OR sub-expression
          return (
            '[' +
            f
              .map((id: any, i: number) =>
                i === 0 ? `[["RequestType.id","=","${id}"]` : `,"or",["RequestType.id","=","${id}"]`
              )
              .join('')
              .replace('[[', '[') +
            ']'
          );
        }
        return f
          .map((id: any, i: number) =>
            i === 0 ? `["RequestType.id","=","${id}"]` : `,"or",["RequestType.id","=","${id}"]`
          )
          .join('');
      }
    }

    // Handle single string value
    if (typeof f === 'string' && f.trim()) {
      return `["RequestType.id", "=", "${f}"]`;
    }

    return null;
  }
  private debugLogFilter(name: string, segment: string) {
    try {
      if (!environment.production) {
      }
    } catch (e) {
      // ignore
    }
  }

  private buildUrlQueryParamsPendingRequests(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      isExportDocument?: boolean | null;
      searchKeyword?: string;
      statusId?: string;
      exportTypeId?: string;
      documentType?: string;
      requestContainerId?: string;
      foundationId?: any;
      requestTypeId?: any;
      consultantId?: string;
      sectorId?: string;
      priorityId?: string;
      nextStepTitle?: string;
      fromDate?: string;
      toDate?: string;
      fromDateHijri?: string;
      toDateHijri?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData, selectedProperties);

    if (filtersData?.searchKeyword)
      url += `&searchText=${encodeURIComponent(filtersData.searchKeyword)}`;

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;
    if (filtersData?.isExportDocument != null) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isExportDocument", "=", "${filtersData.isExportDocument}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.requestContainerId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["RequestContainerId", "=", "${filtersData.requestContainerId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.foundationId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      // detect other filters besides foundation keys
      const hasOtherFilters = Object.keys(filtersData || {}).some((k) => {
        if (k === 'foundationId' || k === 'foundation') return false;
        const v: any = (filtersData as any)[k];
        if (v == null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return v !== '';
        return true;
      });

      const seg = this.getFoundationFilterSegment(filtersData, hasOtherFilters);
      if (seg) {
        url += seg;
        isFirstFilter = false;
      }
      this.debugLogFilter('foundation', seg);
    }

    if (filtersData?.requestTypeId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      const hasOtherFilters = Object.keys(filtersData || {}).some((k) => {
        if (k === 'RequestType') return false;
        const v: any = (filtersData as any)[k];
        if (v == null) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return v !== '';
        return true;
      });

      const seg = this.getRequestTypeFilterSegment(filtersData, hasOtherFilters);
      if (seg) {
        url += seg;
        isFirstFilter = false;
      }
    }

    if (filtersData?.documentType) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["DocumentType", "=", "${filtersData.documentType}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.statusId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["status", "=", "${filtersData.statusId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.exportTypeId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["exportType", "=", "${filtersData.exportTypeId}"]`;
      isFirstFilter = false;
    }

    /*  if (filtersData?.consultantId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Consultant.id", "=", "${filtersData.consultantId}"]`;
      isFirstFilter = false;
    } */

    if (filtersData?.sectorId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["RequestContainer.Sector.id", "=", "${filtersData.sectorId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.priorityId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Priority.id", "=", "${filtersData.priorityId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.nextStepTitle) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["nextStep.title", "=", "${encodeURIComponent(filtersData.nextStepTitle)}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.fromDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["deliveryDate", ">=", "${filtersData.fromDate}"]`;

      isFirstFilter = false;
    }

    if (filtersData?.toDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["deliveryDate", "<=", "${filtersData.toDate}"]`;

      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    if (filtersData?.consultantId) {
      url += `&consultantId=${filtersData.consultantId}`;
    }
    return url;
  }

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    useDefaultSource = false,
    includeFoundationIdParam = true,
    skipFoundationInFilter = false,
    foundationFieldName = 'foundation.id'
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData, selectedProperties);

    if ((!sortData || !sortData.sortType) && useDefaultSource) {
      url += `&Sort=${JSON.stringify([
        {
          selector: 'date',
          desc: true,
        },
        {
          selector: 'autoNumber',
          desc: true,
        },
      ])}`;
    }

    if (filtersData?.searchKeyword)
      url += `&searchText=${encodeURIComponent(filtersData.searchKeyword)}`;

    if (filtersData?.foundationId && includeFoundationIdParam) {
      // preserve existing query param behavior (useful for some endpoints)
      url += `&foundationId=${encodeURIComponent(filtersData.foundationId)}`;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;
    if (filtersData?.isExportDocument != null) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["isExportDocument", "=", "${filtersData.isExportDocument}"]`;
      isFirstFilter = false;
    }
    if (filtersData?.searchText) {
      url += `["name", "contains", "${filtersData.searchText}"]`;
      isFirstFilter = false;
    }
    if (filtersData?.searchFilterQuery) {
      url += filtersData?.searchFilterQuery;
      isFirstFilter = false;
    }

    if (filtersData?.requestContainer) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["RequestContainerId", "=", "${filtersData.requestContainer.id}"]`;
      isFirstFilter = false;
    }

    // foundation filter: support foundationId (array/string) or foundation object
    // Skip in Filter array if using foundationId parameter instead
    if (
      !skipFoundationInFilter &&
      (filtersData?.foundation || filtersData?.foundationId || filtersData?.foundation?.id)
    ) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["${foundationFieldName}", "=", "${
        filtersData.foundation?.id || filtersData.foundationId || filtersData.foundation
      }"]`;
      isFirstFilter = false;
    }

    //
    if (filtersData?.requestType || filtersData?.requestTypeId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["baseRequestType.id", "=", "${
        filtersData.requestType?.id || filtersData?.requestTypeId || filtersData?.requestType
      }"]`;
      isFirstFilter = false;
    }

    if (filtersData?.documentType) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["DocumentType", "=", "${filtersData.documentType}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.status) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["status", "=", "${filtersData.status || filtersData.status.id}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.exportType) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["exportType", "=", "${filtersData.exportType.id}"]`;
      isFirstFilter = false;
    }

    //  if (filtersData?.consultantId) {

    //   url += `["Consultant.id", "=", "${filtersData.consultantId}"]`;
    //   isFirstFilter = false;
    // }

    if (filtersData?.sector) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["RequestContainer.Sector.id", "=", "${filtersData.sector.id}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.priority || filtersData?.priorityId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Priority.id", "=", "${
        filtersData.priority?.id || filtersData.priorityId || filtersData.priority
      }"]`;
      isFirstFilter = false;
    }

    if (filtersData?.committee) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Committee.id", "=", "${
        filtersData.committee.id ? filtersData.committee.id : filtersData.committee
      }"]`;
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

    if (filtersData?.consultant || filtersData?.consultantId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Consultants.id", "=", "${
        filtersData.consultant?.id || filtersData.consultantId || filtersData.consultant
      }"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }

    return url;
  }

  getImportsAndExportsRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequests> {
    let url = `/api/v1/imports-exports?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true
    )}`;
    return this.apiService.get(url);
  }

  getImportsAndExportsRequestsListNew(
    containerId: string,
    queryData?: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequests> {
    // let url = `/api/v1/imports-exports?${this.buildUrlQueryParams(
    //   queryData,
    //   filtersData,
    //   sortData,
    //   selectedProperties,
    //   true
    // )}`;
    let url = this.apiUrl + `/lookup/${containerId}`;
    return this.apiService.get(url);
  }

  getExportsRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllExportRequestModel> {
    delete filtersData?.isExportDocument;
    let url = `/api/v1/exportabledocument?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true,
      false, // Don't include foundationId as parameter
      false, // Include foundation in Filter array
      'foundations.id' // Use plural form for exports
    )}`;
    return this.apiService.get(url);
  }

  getExportsRequestsListExcel(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<Blob> {
    delete filtersData?.isExportDocument;
    let url = `/api/v1/exportabledocument/export?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true,
      false, // Don't include foundationId as parameter
      false, // Include foundation in Filter array
      'foundations.id' // Use plural form for exports
    )}`;
    const fileName = `${formatDateToYYYYMMDD(new Date())}.xlsx`;
    return this.apiService.getAndDownloadExcelFile(url, fileName);
  }

  getImportsRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: PendingRequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllImportRequests> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true,
      false, // Don't include foundationId as parameter
      false, // Include foundation in Filter array
      'foundation.id' // Use singular form for imports
    )}`;
    return this.apiService.get(url);
  }

  getUnrelatedRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    requestId?: string
  ): Observable<AllImportRequests> {
    let url = `${this.apiUrl}/${requestId}/unrelated-requests?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true
    )}`;
    return this.apiService.get(url);
  }
  getUnrelatedList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    requestId?: string
  ): Observable<AllImportRequests> {
    let url = `${this.apiUrl}/${requestId}/unrelated?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true
    )}`;
    return this.apiService.get(url);
  }

  /**
   * Updates the users' accessibility for a specific request type.
   * @param type - 'import' or 'export' to determine the request type.
   * @param id - Request ID.
   * @param usersIds - Array of user IDs to update accessibility.
   */
  updateUsersAccessibility(
    type: 'import' | 'export',
    id: string,
    usersIds: string[]
  ): Observable<null> {
    const endpoint =
      type === 'import'
        ? `${this.apiUrl}/${id}/accessibility`
        : `/api/v1/exportabledocument/${id}/accessibility`;

    return this.apiService.put(endpoint, usersIds);
  }

  /**
   * Wrapper to update import users' accessibility.
   */
  updateImportsUsersAccessibility(id: string, usersIds: string[]): Observable<null> {
    return this.updateUsersAccessibility('import', id, usersIds);
  }

  /**
   * Wrapper to update export users' accessibility.
   */
  updateExportsUsersAccessibility(id: string, usersIds: string[]): Observable<null> {
    return this.updateUsersAccessibility('export', id, usersIds);
  }

  deleteRelatedRequestById(requestId: string, relatedRequestId: string): Observable<null> {
    return this.apiService.delete(
      `${this.apiUrl}/${requestId}/related-requests/${relatedRequestId}`
    );
  }

  getImportUsersAccessibilityList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchText?: string; userId?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    requestId?: string
  ): Observable<AllAllowedUsers> {
    let url = `${this.apiUrl}/${requestId}/accessibility?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getExportUsersAccessibilityList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { searchText?: string; userId?: string },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    requestId?: string
  ): Observable<AllAllowedUsers> {
    let url = `/api/v1/exportabledocument/${requestId}/accessibility?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getImportsRequestsListExcel(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<Blob> {
    let url = `${this.apiUrl}/export?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true,
      true, // Include foundationId as parameter
      false, // Include foundation in Filter array
      'foundation.id' // Use singular form for imports
    )}`;
    const fileName = `${formatDateToYYYYMMDD(new Date())}.xlsx`;
    return this.apiService.getAndDownloadExcelFile(url, fileName);
  }

  getRequestTransactions(
    requestId: string,
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestsFiltersForm,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequests> {
    let url = `${this.apiUrl}/${requestId}/transactions?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties,
      true
    )}`;
    return this.apiService.get(url);
  }
  getRequestImportsAndExports(
    id: string,
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequests> {
    let url = `${this.apiUrl}/${id}/imports-exports?${this.buildUrlQueryParams(
      queryData,
      {},
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getExportRequestImportsAndExports(
    id: string,
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRequests> {
    let url = `/api/v1/exportabledocument/${id}/imports-exports?${this.buildUrlQueryParams(
      queryData,
      {},
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }
  getPendingRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      searchKeyword?: string;
      foundationId?: any;
      requestTypeId?: string;
      priorityId?: string;
      nextStepTitle?: string;
      consultantId?: string;
      exportTypeId?: string;
      fromDate?: string;
      toDate?: string;
      fromDateHijri?: string;
      toDateHijri?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllPendingRequests> {
    let url = `${this.apiUrl}/pending?${this.buildUrlQueryParamsPendingRequests(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getRequestById(id: string): Observable<RequestDetails> {
    return this.apiService.get(`${this.apiUrl}/${id}`);
  }

  addImport(data: AddRequestCommand): Observable<{
    id: string;
    autoNumber: number;
    importNumber: number;
    status: RequestStatus;
  }> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateImport(requestId: string, data: UpdateRequestCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${requestId}`, data);
  }

  updateAttachments(requestId: string, data: string[]): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${requestId}/attachments`, {
      attachmentsIds: data,
    });
  }
  updateAssignedUser(requestId: string): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${requestId}/current-step/assign`, {});
  }
  deleteAssignedUser(requestId: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${requestId}/current-step/unassign`);
  }

  deleteRequest(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
  deleteAttachment(attachmentId: string, requestId: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${requestId}/attachments/${attachmentId}`);
  }

  addAttachment(requestId: string, body: any): Observable<any> {
    return this.apiService.post(`${this.apiUrl}/${requestId}/attachments`, body);
  }
  private getImportAddFormData(data: AddRequestCommand): FormData {
    const formData: FormData = this.getCommonImportData(data);
    formData.append('RequestTypeId', data.requestTypeId);
    formData.append('ClassificationId', data.classificationId);

    if (data.requestContainerId) {
      formData.append('RequestContainerId', data.requestContainerId);
    }

    if (data.committeeId) {
      formData.append('committeeId', data.committeeId);
    }

    if (data.usersIds) {
      data.usersIds.forEach((ele: string) => {
        formData.append('UsersIds', ele);
      });
    }

    return formData;
  }

  private getImportUpdateFormData(data: UpdateRequestCommand): FormData {
    const formData: FormData = objectToFormData(data);
    return formData;
  }

  private getCommonImportData(data: any) {
    const formData: FormData = new FormData();
    formData.append('Title', data.title);
    formData.append('Description', data.description);
    formData.append('PhysicalDate', data.physicalDate);
    formData.append('DeliveryDate', data.deliveryDate);
    formData.append('AvailabilityDate', data.availabilityDate);
    if (data.creditsRequestedAmount !== null) {
      formData.append('CreditsRequestedAmount', `${data.creditsRequestedAmount}`);
    }

    if (data.creditsApprovedAmount !== null) {
      formData.append('CreditsApprovedAmount', `${data.creditsApprovedAmount}`);
    }
    if (data.costsRequestedAmount !== null) {
      formData.append('CostsRequestedAmount', `${data.costsRequestedAmount}`);
    }
    if (data.costsApprovedAmount !== null) {
      formData.append('CostsApprovedAmount', `${data.costsApprovedAmount}`);
    }
    formData.append('PhysicalNumber', data.physicalNumber);
    formData.append('DeliveryNumber', data.deliveryNumber);
    formData.append('Note', data.note);

    formData.append('PriorityId', data.priorityId);

    formData.append('FoundationId', data.foundationId);
    if (data.subFoundationId) {
      formData.append('SubFoundationId', data.subFoundationId);
    }

    data.concernedFoundationsIds.forEach((ele: string) => {
      formData.append('ConcernedFoundationsIds', ele);
    });

    formData.append('AttachmentDescription', data.attachmentDescription);

    return formData;
  }

  /////////////////// Related requests ////////////////////////
  getRelatedRequestsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {
      requestId: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRelatedRequests> {
    return this.apiService.get(
      `${this.apiUrl}/${filtersData.requestId}/related-requests?${this.buildUrlQueryParams(
        queryData,
        undefined,
        sortData,
        selectedProperties,
        false
      )}`
    );
  }

  addRelatedRequests(requestId: string, data: AddRelatedRequestsCommand): Observable<null> {
    return this.apiService.post(`${this.apiUrl}/${requestId}/related-requests`, data);
  }

  ////////////////////////// التسلسل الزمني //////////////////////////////
  getRequestActions(requestId: string, isDescSort: boolean): Observable<RequestAction[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/actions?isDescSort=${isDescSort}`);
  }

  ///////////////////////////////////Execute Request actions////////////////
  executeRequestAction(
    requestId: string,
    actionId: string,
    actionType: ActionType,
    data?: any
  ): Observable<any> {
    //
    let formData = new FormData();
    if (
      actionType === ActionType.Approve ||
      actionType === ActionType.RedirectingRequest ||
      actionType === ActionType.ChangeRequest
    ) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }
      if (data.attachment) {
        formData.append('Attachment', data.attachment, data.attachment.name);
      }
    } else if (actionType === ActionType.Delegate) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }
      if (data.delegatedToId) {
        formData.append('DelegatedTo', data.delegatedToId);
      }
    } else if (actionType === ActionType.SelectConsultants) {
      if (data.ConsultantsIds && Array.isArray(data.ConsultantsIds)) {
        formData.append('Consultants', JSON.stringify(data.ConsultantsIds));
      }
      if (data.mainConsultantId) {
        formData.append('MainConsultantId', data.mainConsultantId);
      }
    } else if (actionType === ActionType.SelectRecommendationType) {
      if (data.recommendationTypeId) {
        formData.append('RecommendationTypeId', data.recommendationTypeId);
      }
    } else if (actionType === ActionType.SelectBenefitType) {
      if (data.benefitTypeId) {
        formData.append('BenefitTypeId', data.benefitTypeId);
      }
    } else if (actionType === ActionType.InternalAssignment) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }
      if (data.assignedToId) {
        formData.append('AssignedTo', data.assignedToId);
      }
    } else if (actionType === ActionType.SelectProcessType) {
      if (data.committeeId) {
        formData.append('CommitteeId', data.committeeId);
      }
      if (data.changeReason) {
        formData.append('ChangeReason', data.changeReason);
      }
    } else if (
      actionType === ActionType.Reject ||
      actionType === ActionType.Archiving ||
      actionType === ActionType.Close
    ) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }
    } else if (
      actionType === ActionType.ExportTypeRecommendation ||
      actionType === ActionType.RecordProducing ||
      actionType === ActionType.LetterProducing ||
      actionType === ActionType.NoteProducing
    ) {
      if (data.exportType) {
        formData.append('ExportType', data.exportType);
      }

      if (data.recordType) {
        formData.append('RecordType', data.recordType);
      }

      if (data.noteType) {
        formData.append('NoteType', data.noteType);
      }

      if (data.otherNoteType) {
        formData.append('OtherNoteType', data.otherNoteType);
      }

      if (data.recommendationTypeId) {
        formData.append('RecommendationTypeId', data.recommendationTypeId);
      }

      if (data.extendDays) {
        formData.append('ExtendDays', data.extendDays);
      }

      if (data.recommendationTypeComment) {
        formData.append('RecommendationTypeComment', data.recommendationTypeComment);
      }

      if (data.creditsRequestedAmount !== null) {
        formData.append('CreditsRequestedAmount', `${data.creditsRequestedAmount}`);
      }

      if (data.creditsApprovedAmount !== null) {
        formData.append('CreditsApprovedAmount', `${data.creditsApprovedAmount}`);
      }

      if (data.creditsAmountMechanism !== null && data.creditsAmountMechanism !== '') {
        formData.append('CreditsAmountMechanism', `${data.creditsAmountMechanism}`);
      }

      if (data.costsRequestedAmount !== null) {
        formData.append('CostsRequestedAmount', `${data.costsRequestedAmount}`);
      }

      if (data.costsApprovedAmount !== null) {
        formData.append('CostsApprovedAmount', `${data.costsApprovedAmount}`);
      }

      if (data.costsAmountMechanism !== null && data.costsAmountMechanism !== '') {
        formData.append('CostsAmountMechanism', `${data.costsAmountMechanism}`);
      }

      if (data.committeeId) {
        formData.append('CommitteeId', data.committeeId);
      }

      if (data.processTypeJustificationsIds) {
        data.processTypeJustificationsIds.forEach((ele: string) => {
          formData.append('ProcessTypeJustificationsIds', ele);
        });
      }

      if (data.committeeChangeReason) {
        formData.append('CommitteeChangeReason', data.committeeChangeReason);
      }

      if (data.outcomeId) {
        formData.append('OutcomeId', data.outcomeId);
      }

      if (data.comment) {
        formData.append('Comment', data.comment);
      }

      if (data.recommendation) {
        formData.append('Recommendation', data.recommendation);
      }

      if (data.recommendationId) {
        formData.append('RecommendationId', data.recommendationId);
      }

      if (data.attachments) {
        data.attachments.forEach((ele: File) => {
          if (ele instanceof Blob) {
            formData.append('Attachments', ele, ele.name);
          }
        });
      }
    } else if (actionType === ActionType.RequestStatement) {
      data.foundationsIds.forEach((ele: string) => {
        formData.append('FoundationsIds', ele);
      });

      if (data.file) {
        formData.append('File', data.file);
      }

      if (data.fileId) {
        formData.append('FileId', data.fileId);
      }

      if (data.comment) {
        formData.append('Comment', data.comment);
      }
    } else if (actionType === ActionType.SignatureFormat) {
      if (data.signatureSettings && data.signatureSettings.length) {
        formData.append('SignatureSettings', JSON.stringify(data.signatureSettings));
      }

      formData.append(
        'SignatureRequireAttendance',
        data.signatureRequireAttendance === YesNo.Yes ? 'true' : 'false'
      );
    } else if (actionType === ActionType.SummarizeExportDocument) {
      if (data.document) {
        formData.append('Document', data.document, data.document.name);
      }

      if (data.documentId) {
        formData.append('DocumentId', data.documentId);
      }
    } else if (actionType === ActionType.ExportTemplate) {
      formData.append('exportNumber', data.exportNumber);

      if (data.document && data.document instanceof Blob) {
        formData.append('Document', data.document, data.document.name || 'document.pdf');
      }

      if (data.normalPagesIndexes && data.normalPagesIndexes.length) {
        data.normalPagesIndexes.forEach((ele: number) => {
          formData.append('normalPagesIndexes', ele + '');
        });
      }

      if (data.noteFile && data.noteFile instanceof Blob) {
        formData.append('NoteFile', data.noteFile, data.noteFile.name || 'note.pdf');
      }

      if (data.signatures && data.signatures.length) {
        formData.append('Signatures', JSON.stringify(data.signatures));
      }
    } else if (actionType === ActionType.Export) {
      if (data.exportingMethod) {
        formData.append('ExportingMethod', `${data.exportingMethod}`);
      }
      if (data.exportTo) {
        formData.append('ExportedToRC', data.exportTo === DocumentExportTo.RC ? 'true' : 'false');
      }

      if (data.physicalGregorianDate) {
        formData.append('PhysicalDate', data.physicalGregorianDate);
      }
      if (data.foundationsIds) {
        data.foundationsIds.forEach((ele: number) => {
          formData.append('foundationsIds', ele + '');
        });
      }

      if (data.barcode) {
        formData.append('Barcode', JSON.stringify(data.barcode));
      }
    } else if (actionType === ActionType.LegalAuditing || actionType === ActionType.Proofreading) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }
      if (data.document) {
        formData.append('Document', data.document);
      }
      if (data.documentId) {
        formData.append('DocumentId', data.documentId);
      }
    } else if (actionType === ActionType.ReUploadDocument) {
      if (data.comment) {
        formData.append('Comment', data.comment);
      }

      if (data.document) {
        formData.append('Document', data.document);
      }
    } else if (actionType === ActionType.UploadCommitteeApprovalDocument) {
      if (data) {
        formData.append('Document', data.document, data.document.name);
        formData.append('CommitteeStepGroup', data.CommitteeStepGroup);
      }
    }

    /////////////////////////////////////////////
    return this.apiService.putFormData(
      `${this.apiUrl}/${requestId}/executing-action/${actionId}`,
      formData
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  getRequestSingleAttachment(attachmentId: string): Observable<Blob> {
    return this.apiService.getFile(`${this.apiUrl}/attachments/${attachmentId}`);
  }

  getNewRequestSingleAttachment(attachmentId: string): Observable<Blob> {
    return this.apiService.getFile(`${this.apiUrl}/attachments/${attachmentId}/blob`);
  }

  updateRequestStepDraft(
    requestId: string,
    actionId: string,
    data: {
      file: Blob;
      content: string;
    }
  ): Observable<null> {
    const formData = new FormData();
    /*     formData.append('File', data.file, data.file.name);
     */
    formData.append('Content', data.content);
    formData.append('File', data.file);

    return this.apiService.putFormData(
      `${this.apiUrl}/${requestId}/step/${actionId}/draft`,
      formData
    );
  }

  //////////////////////////  التسلسل الزمني المصغر //////////////////////////////
  getRequestTimeLine(requestId: string): Observable<RequestTimeLine[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/timeline`);
  }

  //////////////////////////  سكشن دراسة مقترح //////////////////////////////
  getExportRecommendation(requestId: string): Observable<RequestExportRecommendation> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/export-recommendation`);
  }

  //////////////////////////  سكشن قائمة موافقة الاعضاء //////////////////////////////
  getCommitteeApprovals(requestId: string): Observable<CommitteeApproval[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/committeeApprovals`);
  }

  //////////////////////////  رقم الصادر //////////////////////////////
  getExportNumber(requestId: string): Observable<number> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/export-number`);
  }

  //////////////////////////////get import barcode (request's barcode)//////////////////////////////////////

  getExportedDocument(requestId: string): Observable<Blob> {
    return this.apiService.getFile(`${this.apiUrl}/${requestId}/export-document`);
  }

  getBarcode(requestId: string, withTemplate: boolean = true): Observable<string> {
    //returns base54 string image
    return this.apiService.get(`${this.apiUrl}/${requestId}/barcode?withTemplate=${withTemplate}`);
  }

  getBarcodeDetails(requestId: string): Observable<BarcodeNoBackgroundDetails> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/barcode/details`);
  }

  getBarcodeUrl(requestId: string): string {
    //returns Blob string image
    return `${this.baseUrl}${
      this.apiUrl
    }/${requestId}/barcode/blob?access_token=${this.authService.getToken()}`;
  }

  getInitiator(requestId: string): Observable<{ id: string; name: string }> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/initiation-user`);
  }

  getPreviousRequestSteps(requestId: string): Observable<RequestStep[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/previous-steps`);
  }

  resetRequest(requestId: string, requestStepId: string | null): Observable<null> {
    return this.apiService.put(
      `${this.apiUrl}/${requestId}/reset/${
        requestStepId ? requestStepId : '00000000-0000-0000-0000-000000000000'
      }`,
      {}
    );
  }

  getImportAttachmentsList(requestId: string): Observable<Attachment[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/attachments`);
  }

  getCurrentStepsList(): Observable<string[]> {
    return this.apiService.get(`${this.apiUrl}/current-steps`);
  }

  takeCommitteeApprovalAction(
    requestId: string,
    memberId: string,
    data: {
      approval: MemberApprovalType;
      comment?: string;
    }
  ): Observable<null> {
    return this.apiService.put(
      `${this.apiUrl}/${requestId}/CommitteeApprovals/members/${memberId}`,
      data
    );
  }

  getCommitteeApprovalsByStepId(
    requestId: string,
    stepId: string
  ): Observable<CommitteeApproval[]> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/CommitteeApprovals/steps/${stepId}`);
  }

  // exportExcel(
  //   queryData: { pageSize: number; pageIndex: number },
  //   filtersData?: RequestsFiltersForm,
  //   sortData?: { sortBy: string; sortType: SortDirection },
  //   selectedProperties?: string[]
  // ): Observable<Blob> {
  //   let url = `${this.apiUrl}/export?${this.buildUrlQueryParams(
  //     queryData,
  //     filtersData,
  //     sortData,
  //     selectedProperties,
  //     true
  //   )}`;
  //
  //   const fileName = `${formatDateToYYYYMMDD(new Date())}.xlsx`;
  //   return this.apiService.getAndDownloadExcelFile(url, fileName);
  // }
  getFullPreview(id: string): Observable<Transaction> {
    let url = `${this.apiUrl}/${id}/full-preview`;

    return this.apiService.get(url);
  }

  getPreview(id: string): Observable<any> {
    let url = `${this.apiUrl}/${id}/preview`;

    return this.apiService.get(url);
  }
  getCurrentExportStatement(requestId: string): Observable<ExportStatement> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/export-statement`);
  }

  getRequestAttachments(
    requestId: string,
    filtersData?: { searchKeyword?: string }
  ): Observable<Attachment[]> {
    const searchText = filtersData?.searchKeyword
      ? `searchText=${encodeURIComponent(filtersData.searchKeyword)}`
      : '';
    return this.apiService.get(
      `${this.apiUrl}/${requestId}/attachments${searchText ? '?' + searchText : ''}`
    );
  }

  getRelatedTransactions(requestId: string): Observable<any> {
    return this.apiService.get(`${this.apiUrl}/${requestId}/related`);
  }
}
