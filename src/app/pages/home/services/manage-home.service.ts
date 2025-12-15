import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { MeetingsService } from '@core/services/backend-services/meetings.service';
import { NewsPostsService } from '@core/services/backend-services/news-posts.service';
import { StatisticsService } from '@core/services/backend-services/statistics.service';
import {
  FoundationDtoLoadResultDto,
  RegulatoryDocumentsDto,
  RegulatoryDocumentsDtoLoadResultDto,
} from '../interfaces/policy.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ManageHomeService {
  apiUrl = '/api/v1/regulatory-documents';
  constructor(
    public meetingsService: MeetingsService,
    public latestNewsService: NewsPostsService,
    public statisticsService: StatisticsService,
    private apiService: ApiService
  ) {}

  getCategories(): Observable<FoundationDtoLoadResultDto> {
    let url = `/api/v1/regulatory-categories`;
    return this.apiService.get(url);
  }
  getCategoriesLookup(): Observable<FoundationDtoLoadResultDto> {
    let url = `/api/v1/regulatory-categories/lookup`;
    return this.apiService.get(url);
  }

  private buildCategoryDataUrlParams(
    queryData: { pageSize: number; pageIndex: number },
    filterData?: {
      categoryId?: string;
      searchKeyword?: string;
    },
    sortData?: { selector: string; desc: boolean }[]
  ): string {
    const skip = queryData.pageSize * queryData.pageIndex;
    let url = `RequireTotalCount=true&Skip=${skip}&Take=${queryData.pageSize}`;
    const params: string[] = [];

    if (filterData?.categoryId) {
      params.push(`Filter=[["category.id", "=", "${filterData.categoryId}"]]`);
    }
    if (filterData?.searchKeyword) {
      params.push(`Filter=[["title", "contains", "${filterData.searchKeyword}"]]`);
    }

    if (sortData && sortData.length > 0) {
      params.push(
        `Group=[${sortData.map((s) => `{selector: "${s.selector}", desc: ${s.desc}}`).join(',')}]`
      );
    }

    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }

    return url;
  }

  getCategoryData(
    filterData?: {
      categoryId?: string;
      searchKeyword?: string;
    },
    sortData?: { selector: string; desc: boolean }[],
    queryData: { pageSize: number; pageIndex: number } = { pageSize: 20, pageIndex: 0 }
  ): Observable<RegulatoryDocumentsDtoLoadResultDto> {
    let url = `${this.apiUrl}?${this.buildCategoryDataUrlParams(queryData, filterData, sortData)}`;
    return this.apiService.get(url);
  }
  getDataById(id: string): Observable<RegulatoryDocumentsDto> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
  add(body: any): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, body);
  }
  update(body: any): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/${body.id}`, body);
  }
  activate(id: string): Observable<any> {
    return this.apiService.post(`${this.apiUrl}/${id}/activation`, id);
  }
}
