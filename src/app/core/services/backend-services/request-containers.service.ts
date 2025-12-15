import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';

import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  UpdateTransactionCommand,
  AllTransactions,
  UpdateTransactionAmountsCommand,
  Transaction,
  AllRelatedContainers,
  AddTransactionCommand,
  RequestContainerTimeLine,
  RequestContainersFiltersForm,
  RequestContainersFiltersForm2,
} from '@core/models/transaction.model';
import { RequestAction } from '@core/models/request-action.model';
import { AllAllowedUsers, AllRequests } from '@core/models/request.model';
import { removeFirstAndLastChar } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class RequestContainersService {
  readonly apiUrl = '/api/v1/requestcontainers';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestContainersFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData, selectedProperties);
    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let searchText = null;
    let isFirstFilter = true;

    if (filtersData?.searchKeyword) {
      filtersData.searchKeyword = filtersData?.searchKeyword.trim();
      if (filtersData.searchKeyword.charAt(0) === '"') {
        const str = removeFirstAndLastChar(filtersData.searchKeyword, '"');

        if (str.length >= 6) {
          url += `[ ["transactionNumber", "=", "${str.substring(
            2,
            100
          )}"], 'and', ["year", "=", "20${str.substring(0, 2)}"] ] `;
          isFirstFilter = false;
        } else {
          if (str.length > 0) {
            url += ` ["transactionNumber", "=", "${encodeURIComponent(str)}"] `;
            isFirstFilter = false;
          }
        }
      } else {
        searchText = encodeURIComponent(filtersData.searchKeyword);
      }
    }

    if (filtersData?.foundation) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      const foundationId =
        typeof filtersData.foundation === 'string'
          ? filtersData.foundation
          : filtersData.foundation?.id;
      url += `["Foundation.id", "=", "${foundationId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.containerStatus) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["ContainerStatus", "=", "${filtersData.containerStatus}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.sector) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      const sectorId =
        typeof filtersData.sector === 'string' ? filtersData.sector : filtersData.sector?.id;
      url += `["Sector.id", "=", "${sectorId}"]`;
      isFirstFilter = false;
    }
    if (filtersData?.classification) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Classification.id", "=", "${filtersData.classification.id}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.priority) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      const priorityId =
        typeof filtersData.priority === 'string' ? filtersData.priority : filtersData.priority?.id;
      url += `["Priority.id", "=", "${priorityId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.fromDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["createdOn", ">=", "${filtersData.fromDate}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.nextStep) {
      if (!isFirstFilter) {
        url += ",'and',";
      }
      const nextStepTitle =
        typeof filtersData.nextStep === 'string'
          ? filtersData.nextStep
          : filtersData.nextStep?.title;
      url += `["nextStep.title", "=", "${nextStepTitle}"]`;
      isFirstFilter = false;
    }
    if (filtersData?.toDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["createdOn", "<=", "${filtersData.toDate}"]`;
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }
    if (searchText) url += `&searchText=${searchText}`;

    return url;
  }

  getTransactionsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestContainersFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllTransactions> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }
  getTransactionsListInImport(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestContainersFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllTransactions> {
    let url = `${this.apiUrl}/link?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }
  getTransactionsListLookup(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: RequestContainersFiltersForm2,
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllTransactions> {
    let url = `${this.apiUrl}/lookup?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getTransactionImportsAndExports(
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

  getTransactionById(id: string): Observable<Transaction> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addTransaction(data: AddTransactionCommand): Observable<{ id: string; autoNumber: string }> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateTransaction(data: UpdateTransactionCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  updateContainerAccessibility(id: string, usersIds: string[]): Observable<null> {
    return this.apiService.put(`${this.apiUrl}/${id}/accessibility`, usersIds);
  }

  getUsersAccessibilityList(
    filtersData?: {
      searchText?: string;
      hasAccess?: boolean | null;
    },
    requestId?: string
  ): Observable<AllAllowedUsers> {
    let query =
      filtersData?.hasAccess != null ? [`["hasAccess","=",${filtersData?.hasAccess}]`] : [];
    filtersData?.searchText ? query.push(`["name","=",${filtersData?.searchText}]`) : null;
    let url = `${this.apiUrl}/${requestId}/accessibility?${
      query.length > 0 ? `Filter=[${query.join(', "and" ,')}]` : ''
    } `;
    return this.apiService.get(url);
  }

  deleteTransaction(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  updateTransactionAmounts(amounts: UpdateTransactionAmountsCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/amounts-manipulation`, amounts);
  }

  getRelatedContainersList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {
      requestContainerId: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllRelatedContainers> {
    let url = `${this.apiUrl}/${
      filtersData.requestContainerId
    }/related-containers?${this.buildUrlQueryParams(
      queryData,
      undefined,
      sortData,
      selectedProperties
    )}`;

    return this.apiService.get(url);
  }

  ////////////////////////// التسلسل الزمني //////////////////////////////
  getRequestContainerActions(
    requestContainerId: string,
    isDescSort: boolean
  ): Observable<RequestAction[]> {
    return this.apiService.get(
      `${this.apiUrl}/${requestContainerId}/actions?isDescSort=${isDescSort}`
    );
  }

  //////////////////////////  التسلسل الزمني المصغر //////////////////////////////
  getRequestContainerTimeLine(requestContainerId: string): Observable<RequestContainerTimeLine[]> {
    return this.apiService.get(`${this.apiUrl}/${requestContainerId}/timeline`);
  }
}
