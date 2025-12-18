import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PageLoaderService } from '@core/services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(private pageLoaderService: PageLoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/assets')) {
      return next.handle(req);
    }

    if (req.url.includes('refresh-token')) {
      return next.handle(req);
    }

    // Check for X-Skip-Loader header
    const skipLoaderHeader = req.headers.get('X-Skip-Loader');
    if (skipLoaderHeader === 'true' || req.headers.has('X-Skip-Loader')) {
      return next.handle(req);
    }

    this.requests.push(req);
    this.pageLoaderService.isLoading.next(true);

    return next.handle(req).pipe(finalize(() => this.removeRequest(req)));
  }

  private removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.pageLoaderService.isLoading.next(this.requests.length > 0);
  }
}
