import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, timeout } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUrl = environment.apiUrl;
  solarBaseUrl = environment.ocrAndSolarApi;

  headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'App-Info': 'Portal-V1.6',
    });
  }

  viewPDF(url: string) {
    return this.http
      .get(this.baseUrl + url, {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        timeout(9900000),
        map((res) => {
          return this.viewPdfInNewTab(res.body);
        })
      );
  }

  viewPdfInNewTab(data: any) {
    const url: string = window.URL.createObjectURL(data);
    window.open(url);
  }
  /**
   * Creates HTTP GET request to the server using the specified API URL
   *
   * @param {string} url API URL
   * @param query
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */

  getNew(url: string, query: any): Observable<any> {
    const fullUrl = this.baseUrl + url;
    return this.http.get(fullUrl, { params: query });
  }

  get(url: string, isOcr: boolean = false, customHeaders?: HttpHeaders): Observable<any> {
    const fullUrl = (isOcr ? this.solarBaseUrl : this.baseUrl) + url;
    let headers = this.headers;
    if (customHeaders) {
      customHeaders.keys().forEach((key) => {
        headers = headers.set(key, customHeaders.get(key)!);
      });
    }

    return this.http.get(fullUrl, {
      headers,
    });
  }

  getFile(url: string): Observable<any> {
    return this.http
      .get(this.baseUrl + url, {
        responseType: 'blob',
      })
      .pipe(timeout(9900000));
  }
  /**
   * Creates HTTP POST request to the server using the specified API URL
   *
   * @param {string} url API URL
   * @param {*} resource The request body
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  post(url: string, resource: any): Observable<any> {
    return this.http.post(this.baseUrl + url, JSON.stringify(resource), {
      headers: this.headers,
    });
  }

  postFormData(url: string, resource: any): Observable<any> {
    return this.http.post(this.baseUrl + url, resource);
  }

  putFormData(url: string, resource: any, isOcr: boolean = false): Observable<any> {
    const fullUrl = (isOcr ? this.solarBaseUrl : this.baseUrl) + url;
    return this.http.put(fullUrl, resource);
  }

  /**
   * Creates HTTP PUT request to the server using the specified API URL
   *
   * @param {string} url API URL
   * @param {*} resource The request body
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  put(url: string, resource: any): Observable<any> {
    return this.http.put(this.baseUrl + url, JSON.stringify(resource), {
      headers: this.headers,
    });
  }

  /**
   * Creates HTTP PATCH request to the server using the specified API URL
   *
   * @param {string} url API URL
   * @param {*} resource The request body
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  patch(
    url: string,
    resource: any,
    customHeader?: { name: string; value: string }
  ): Observable<any> {
    // this.headers.append(customHeader.name, customHeader.value);
    return this.http.patch(this.baseUrl + url, JSON.stringify(resource), {
      headers: this.headers,
    });
  }

  /**
   * Creates HTTP DELETE request to the server using the specified API URL
   *
   * @param {string} url API URL
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  delete(url: string): Observable<any> {
    return this.http.delete(this.baseUrl + url, { headers: this.headers });
  }

  /**
   * Creates HTTP DELETE request to the server using the specified API URL
   * and sends body in the request using the request options
   *
   * @param {string} url API URL
   * @param {*} resource The request body
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  deleteWithBodyRequest(url: string, resource: any): Observable<any> {
    const options = {
      headers: this.headers,
      body: JSON.stringify(resource),
    };
    return this.http.delete(this.baseUrl + url, options);
  }

  /**
   * Creates HTTP POST request to the server using the specified API URL
   * and expects that the response contains a file. It downloads the file automatically
   *
   * @param {string} url API URL
   * @param {*} resource The request body
   * @param {string} fileName The name of the file when downloading it
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  postAndDownloadFile(url: string, resource: any, fileName: string): Observable<any> {
    return this.http
      .post(this.baseUrl + url, JSON.stringify(resource), {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res) => {
          this.downloadFile(res.body!, fileName);
          return res;
        })
      );
  }

  /**
   * Creates HTTP GET request to the server using the specified API URL
   * and expects that the response contains a file. It downloads the file automatically
   *
   * @param {string} url API URL
   * @param {string} fileName The name of the file when downloading it
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  getAndDownloadFile(url: string, fileName: string): Observable<any> {
    return this.http
      .get(this.baseUrl + url, {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        timeout(9900000),
        map((res) => {
          this.downloadFile(res.body!, fileName);
          return res;
        })
      );
  }

  getAndDownloadFileViaUrl(url: string): Observable<any> {
    return this.get(url).pipe(
      tap((res) => {
        const anchor = document.createElement('a');
        anchor.href = res;
        anchor.click();
      })
    );
  }

  /**
   * Makes GET request and adds an account id in the request headers
   *
   * @param {string} url API URL
   * @param {number} accountId The account id to set it in the headers
   * @return {Observable<any>} The request observable
   * @memberof ApiService
   */
  getAndSendAccountIdHeader(url: string, accountId: number): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('accountId', accountId + '');
    return this.http.get(this.baseUrl + url, { headers });
  }

  /**
   * Makes automatic file download.
   *
   * @private
   * @param {*} data The blob file got in the API response
   * @param {string} fileName The name of the file when downloading it
   * @memberof ApiService
   */
  private downloadFile(data: Blob, fileName: string): void {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = url;
    anchor.click();
  }

  postFile(url: string, formData: any, fileType: any): Observable<any> {
    return this.http.post(this.baseUrl + url, formData, {
      headers: new HttpHeaders({
        Accept: '*/*',
      }),
      params: new HttpParams().set('filetype', fileType.toString()),
      reportProgress: true,
      observe: 'events',
    });
  }

  getAndDownloadExcelFile(url: string, fileName: string): Observable<Blob> {
    return this.http.get(this.baseUrl + url, { responseType: 'blob' }).pipe(
      tap((res) => {
        const blobData = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blobData);
        const anchor = document.createElement('a');
        anchor.download = fileName;
        anchor.href = url;
        anchor.click();
      })
    );
  }
}
