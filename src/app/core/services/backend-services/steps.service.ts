import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { SortDirection } from '@angular/material/sort';
import { AllSteps, Step, StepCommand } from '@core/models/step.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class StepsService {
  readonly apiUrl = '/api/v1/steps';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    return buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    );
  }

  getStepsList(
    queryData: { pageSize: number; pageIndex: number },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): Observable<AllSteps> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      sortData,
      selectedProperties
    )}`;
    return this.apiService.get(url);
  }

  getStepById(id: string): Observable<Step> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addStep(data: StepCommand): Observable<any> {
    if (!data.categoryId) {
      delete data.categoryId;
    }
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateStep(data: StepCommand): Observable<any> {
    if (!data.categoryId) {
      delete data.categoryId;
    }
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteStep(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }
}
