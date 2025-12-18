import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  getHijriDate(gregorianDate: string, skipLoader: boolean = false): Observable<string> {
    const fullUrl = `${this.baseUrl}${this.apiUrl}/gethijridate?gregorianDate=${gregorianDate}`;

    if (skipLoader) {
      const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
      return this.http.get(fullUrl, { headers }) as Observable<string>;
    }

    return this.http.get(fullUrl) as Observable<string>;
  }

  getGregorianDate(hijriDate: string, skipLoader: boolean = false): Observable<string> {
    const fullUrl = `${this.baseUrl}${this.apiUrl}/getgregoriandate?hijriDate=${hijriDate}`;

    if (skipLoader) {
      const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
      return this.http.get(fullUrl, { headers }) as Observable<string>;
    }

    return this.http.get(fullUrl) as Observable<string>;
  }
}
