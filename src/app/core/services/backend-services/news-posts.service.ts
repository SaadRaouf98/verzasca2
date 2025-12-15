import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import {
  AllTransactionActions,
  TransactionAction,
} from '@core/models/transaction-action.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';
import {
  AllLatestNews,
  LatestNewsCommand,
  LatestNewsDetails,
} from '@core/models/news-posts.model';

@Injectable({
  providedIn: 'root',
})
export class NewsPostsService {
  readonly apiUrl = '/api/v1/newsposts';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { isVisible?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );

    if (filtersData && filtersData.isVisible) {
      url += `&isVisible=${filtersData.isVisible}`;
    }
    return url;
  }

  getNewsPostsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData?: { isVisible?: boolean },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllLatestNews> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getVisibleNewsPostsList(
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllLatestNews> {
    let url = `${this.apiUrl}/visible?${this.buildUrlQueryParams(
      queryData,
      undefined,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getNewsPostById(id: string): Observable<LatestNewsDetails> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  getNewsPostImageById(postImagePath: string): Observable<Blob> {
    let url = `${this.apiUrl}/images/${postImagePath}`;
    return this.apiService.get(url);
  }

  addNewsPost(data: LatestNewsCommand): Observable<any> {
    return this.apiService.postFormData(
      `${this.apiUrl}`,
      this.getImportFormData(data)
    );
  }
  setVisabilityStatus(id: string, isVisible: boolean): Observable<any> {
    return this.apiService.put(
      `${this.apiUrl}/visibility`,
      { 
         "postId": id,
  "isVisible": isVisible
       }
    );
  }

  updateNewsPost(data: LatestNewsCommand): Observable<any> {
    return this.apiService.putFormData(
      `${this.apiUrl}`,
      this.getImportFormData(data)
    );
  }

  deleteNewsPost(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  private getImportFormData(data: LatestNewsCommand): FormData {
    const formData: FormData = new FormData();
    if (data.id) {
      formData.append('Id', data.id);
    }

    formData.append('Title', data.title);
    if (data.definition) {
      formData.append('Definition', data.definition);
    }
    if (data.content) {
      formData.append('Content', data.content);
    }

    if (data.image) {
      formData.append('Image', data.image, data.image.name);
    }
    formData.append('IsVisible', `${data.isVisible}`);

    return formData;
  }
}
