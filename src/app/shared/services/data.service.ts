import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FilterBuilder} from "@shared/models/filter-builder";
import {LoadOptionParser} from "@shared/models/load-option-builder";
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly baseUrl = 'https://your-api-url.com/api'; // Replace with actual API

  constructor(private http: HttpClient) {
  }
  /** Load data with query string (DevExtreme-style) */
  getData(endpoint: string, loadOptions: any): Observable<any> {
    const query = new LoadOptionParser(loadOptions).toQueryString();
    return this.http.get(`${this.baseUrl}${query}`);
  }
  /** Expose FilterBuilder so component can build clean filters */
  createFilter(logic: 'and' | 'or' = 'and'): FilterBuilder {
    return new FilterBuilder(logic);
  }
}

