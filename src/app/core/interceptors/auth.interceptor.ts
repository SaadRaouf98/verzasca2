import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { catchError, timeout } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { AuthUtils } from '@core/helpers';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private languageService: LanguageService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request object
    const authService = this.injector.get(AuthService);
    let newReq = req.clone();
    const token = authService.getToken();
    if (token && !AuthUtils.isTokenExpired(token)) {
      // Check if the request body is of FormData type and if it is, then don't add content-type header
      if (req.body instanceof FormData) {
        newReq = req.clone({
          headers: req.headers
            .set('Authorization', 'Bearer ' + token)
            .set('Accept-Language', this.languageService.language),
        });
      } else {
        newReq = req.clone({
          headers: req.headers
            .set('content-type', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .set('Accept-Language', this.languageService.language),
        });
      }

      // check if req is PUT,PATCH or DELETE and req body has _etag then add it to headers
      if (['PUT', 'PATCH', 'DELETE'].includes(newReq.method) && newReq.body && newReq.body._etag) {
        newReq = newReq.clone({
          headers: newReq.headers.set('If-Match', req.body._etag),
        });
      }
    }

    let reqTimeOut = 5000;
    if (req.url.includes('/api/wopi/files') || req.url.includes('regularreports')) {
      reqTimeOut = 9900000;
    }

    // Response
    return next.handle(newReq).pipe(
      catchError((error) => {
        // Catch "401 Unauthorized" responses
        if (error instanceof HttpErrorResponse && error.status === 401) {
          authService.authenticated = false;
          authService.signInUsingRefreshToken().subscribe({
            next: (accessToken) => {
              //Retry the last request
              newReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + accessToken),
              });
              next.handle(newReq);
            },
            error: (error) => {},
          });
          return throwError(() => error);
        } else if (error instanceof HttpErrorResponse && error.status === 403) {
          // Check if request is from preview endpoint - don't show popup for those
          // Let the component handle it instead
          if (req.url.includes('preview') || req.url.includes('exportablePdfDocument')) {
            return throwError(() => error);
          }
          // Only handle 403 Forbidden here for other requests
          this.noPermission();
          return throwError(() => error);
        } else {
          // For all other errors, pass them through to the next interceptor (ErrorHandlerInterceptor)
          return throwError(() => error);
        }
      })
    );
  }

  noPermission() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(AuthorizationPopupComponent, {
      minWidth: '36.25rem',
      maxWidth: '36.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: false,
      data: {
        title: this.translateService.instant('unauthorized.accessDenied'),
        message: `${this.translateService.instant('unauthorized.youDoNotHavePermission')} `,
        authorizationInside: true,
      },
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      this.router.navigateByUrl('/');
    });
  }
}
