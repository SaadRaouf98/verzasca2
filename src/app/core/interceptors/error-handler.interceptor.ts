import { MatDialog } from '@angular/material/dialog';
import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retryWhen, mergeMap, delay } from 'rxjs/operators';
import { ErrorDialogComponent } from '@shared/components/error-dialog/error-dialog.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Retrying 3 times before throwing the error (A time every 0.5s)
    let counter = 0;
    let matDialog = this.injector.get(MatDialog);
    let toastr = this.injector.get(CustomToastrService);
    return next.handle(request).pipe(
      retryWhen((errors) => {
        return errors.pipe(
          mergeMap((err: HttpErrorResponse) => {
            if (err && err.error instanceof ProgressEvent && counter < 3) {
              counter++;
              return of(err);
            }
            return throwError(err);
          }),
          delay(1000)
        );
      }),
      catchError((err: HttpErrorResponse, catch$: Observable<HttpEvent<unknown>>) => {
        matDialog.closeAll();
        // matDialog.open(ErrorDialogComponent, {
        //   width: '600px',
        //   autoFocus: false,
        //   disableClose: true,
        //   data: err,
        // });
        console.log(err);

        let errorMessage = 'خطأ في الاتصال. يتعذر الاتصال بالخادم حاليًا.';

        // Handle Blob response
        if (err.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result as string);
              errorMessage = errorData?.Message || errorData?.Errors?.[0]?.Message || errorMessage;
              toastr.error(errorMessage);
            } catch (e) {
              toastr.error(errorMessage);
            }
          };
          reader.readAsText(err.error);
        } else {
          // Handle regular JSON response
          errorMessage = err?.error?.Message || err?.error?.Errors?.[0]?.Message || errorMessage;
          toastr.error(errorMessage);
        }

        return throwError(err);
      })
    );
  }
}
