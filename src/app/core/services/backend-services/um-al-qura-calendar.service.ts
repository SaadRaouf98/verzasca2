import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UmAlQuraCalendarService {
  readonly baseUrl = environment.apiUrl;
  readonly apiUrl = '/api/umalquracalendar';

  constructor(private http: HttpClient) {}

  getHijriDate(gregorianDate: string): Observable<string> {
    const fullUrl = `${this.baseUrl}${this.apiUrl}/gethijridate?gregorianDate=${gregorianDate}`;

    return this.http.get(fullUrl) as Observable<string>;
  }

  getGregorianDate(hijriDate: string): Observable<string> {
    const fullUrl = `${this.baseUrl}${this.apiUrl}/getgregoriandate?hijriDate=${hijriDate}`;

    return this.http.get(fullUrl) as Observable<string>;
  }
}
