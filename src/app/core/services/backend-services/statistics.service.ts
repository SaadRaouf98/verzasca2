import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { StatisticsSummary } from '@core/models/statistics-summary.model';
import { TransactionsStatusStatistics } from '@core/models/transactions-statistics-status.model';
import { DocumentsStatistics } from '@core/models/documents-statistics-summary';
import { CommitteeRecordsStatistics } from '@core/models/committee-records-statistics.model';
import { FoundationsAmounts } from '@core/models/foundations-amounts.model';
import { DatesAmounts } from '@core/models/dates-amounts.model';
import { RecommendationResults } from '@core/models/recommendation-results.model';
import { PriorityTransactions } from '@core/models/priority-transactions.model';
import { SystematicImports } from '@core/models/systematic-imports.model';
import { CommitteeApprovals } from '@core/models/committee-approvals.model';
import { PriorityRecords } from '@core/models/priority-records.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  readonly apiUrl = '/api/v1/statistics';

  constructor(private apiService: ApiService) {}

  getSummary(): Observable<StatisticsSummary> {
    let url = `${this.apiUrl}/summary`;

    return this.apiService.get(url);
  }

  getTransactionsStatus(
    startDate: string,
    endDate: string
  ): Observable<TransactionsStatusStatistics> {
    let url = `${this.apiUrl}/transactions-status`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getNotesAndLettersStatistics(
    startDate: string,
    endDate: string
  ): Observable<DocumentsStatistics> {
    let url = `${this.apiUrl}/documents`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getCommitteeRecordsStatistics(
    startDate: string,
    endDate: string
  ): Observable<CommitteeRecordsStatistics> {
    let url = `${this.apiUrl}/committee-records`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getTransactionsStatistics(
    startDate: string,
    endDate: string
  ): Observable<TransactionsStatusStatistics> {
    let url = `${this.apiUrl}/transactions`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getFoundationsAmounts(
    startDate: string,
    endDate: string
  ): Observable<FoundationsAmounts> {
    let url = `${this.apiUrl}/foundations-amounts`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getDatesAmounts(
    startDate: string,
    endDate: string
  ): Observable<DatesAmounts[]> {
    let url = `${this.apiUrl}/dates-amounts`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getRecommendationResults(
    startDate: string,
    endDate: string
  ): Observable<RecommendationResults> {
    let url = `${this.apiUrl}/recommendation-results-V2`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getPriorityTransactions(
    startDate: string,
    endDate: string
  ): Observable<PriorityTransactions> {
    let url = `${this.apiUrl}/priority-transactions`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getSystematicImports(
    startDate: string,
    endDate: string
  ): Observable<SystematicImports> {
    let url = `${this.apiUrl}/systematic-imports`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getCommitteeApprovals(
    startDate: string,
    endDate: string
  ): Observable<CommitteeApprovals[]> {
    let url = `${this.apiUrl}/committee-approvals`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }

  getPriorityRecords(
    startDate: string,
    endDate: string
  ): Observable<PriorityRecords> {
    let url = `${this.apiUrl}/priority-records`;
    if (startDate) {
      url += `?StartDate=${startDate}&endDate=${endDate}`;
    }
    return this.apiService.get(url);
  }
}
