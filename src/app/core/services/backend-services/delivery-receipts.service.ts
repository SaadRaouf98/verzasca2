import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import {
  AllDeliveryReceipt,
  AllDeliveryReceiptTable,
  DeliveryReceiptBasicRow,
  UpdateDeliveryReceiptsRowsCommand,
} from '@core/models/delivery-receipt.model';
import { Observable } from 'rxjs';
import { SortDirection } from '@angular/material/sort';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class DeliveryReceiptsService {
  readonly apiUrl = '/api/v1/deliveryreceipts';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      creatorId?: string;
      fromDate?: string;
      toDate?: string;
      fromDateHijri?: string;
      toDateHijri?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(queryData, sortData);
    if (filtersData && Object.keys(filtersData).length) {
      url += '&Filter=[';
    }

    let isFirstFilter = true;

    if (filtersData?.creatorId) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["Creator.id", "=", "${filtersData.creatorId}"]`;
      isFirstFilter = false;
    }

    if (filtersData?.fromDate) {
      if (!isFirstFilter) {
        url += ",'and',";
      }

      url += `["deliveryDate", ">=", "${filtersData.fromDate}"]`;

      if (filtersData?.toDate) {
        url += ",'and',";

        url += `["deliveryDate", "<=", "${filtersData.toDate}"]`;
      }
      isFirstFilter = false;
    }

    if (filtersData && Object.keys(filtersData).length) {
      url += ']';
    }
    return url;
  }

  getDeliveryReceiptsBasicRows(
    documentsIds: string[]
  ): Observable<DeliveryReceiptBasicRow[]> {
    return this.apiService.post(`${this.apiUrl}/details`, {
      documentsIds,
    });
  }

  updateDeliveryReceiptsBasicRows(
    documents: UpdateDeliveryReceiptsRowsCommand[]
  ): Observable<AllDeliveryReceipt[]> {
    return this.apiService.post(`${this.apiUrl}`, {
      documents,
    });
  }

  getDeliveryReceiptsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: {
      creatorId?: string;
      fromDate?: string;
      toDate?: string;
      fromDateHijri?: string;
      toDateHijri?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllDeliveryReceiptTable> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;
    return this.apiService.get(url);
  }

  updateDeliveryReceiptDate(receiptId: string, deliveryDate: string) {
    return this.apiService.put(`${this.apiUrl}`, {
      receiptId,
      deliveryDate,
    });
  }
}
