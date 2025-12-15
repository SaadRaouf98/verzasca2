import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  RequestContainerAdvancedSearchResult,
  RequestContainerAdvancedSearchQueryParams,
} from '@core/models/request-container-advance-search.model';

@Injectable({
  providedIn: 'root',
})
export class RequestContainerAdvancedSearchService {
  readonly apiUrl = '/api/v1/requestcontainer';

  constructor(private apiService: ApiService) {}

  getContainersList(
    requestContainerAdvancedSearchQueryParams: RequestContainerAdvancedSearchQueryParams
  ): Observable<RequestContainerAdvancedSearchResult[]> {
    let url = `${this.apiUrl}?Operator=${requestContainerAdvancedSearchQueryParams.operator}`;

    if (requestContainerAdvancedSearchQueryParams?.requestContainerId) {
      url += `&RequestContainerId=${requestContainerAdvancedSearchQueryParams.requestContainerId}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.autoNumber) {
      url += `&AutoNumber=${requestContainerAdvancedSearchQueryParams.autoNumber}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.title) {
      url += `&Title=${requestContainerAdvancedSearchQueryParams.title}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.requests) {
      url += `&Requests=${requestContainerAdvancedSearchQueryParams.requests}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.exportableDocuments) {
      url += `&ExportableDocuments=${requestContainerAdvancedSearchQueryParams.exportableDocuments}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.requestStepContents) {
      url += `&RequestStepContents=${requestContainerAdvancedSearchQueryParams.requestStepContents}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.foundation) {
      url += `&Foundation=${requestContainerAdvancedSearchQueryParams.foundation}`;
    }

    if (requestContainerAdvancedSearchQueryParams?.sector) {
      url += `&Sector=${requestContainerAdvancedSearchQueryParams.sector}`;
    }

    return this.apiService.get(url, true);
  }
}
