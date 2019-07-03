import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Emittable, Emitter} from '@ngxs-labs/emitter';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {isString} from 'util';
import {AppState} from '../store/app.state';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  @Emitter(AppState.LogoutAction)
  Logout$: Emittable<void>;

  constructor(private snackBar: MatSnackBar,
              private translate: TranslateService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.log('ErrorInterceptor', request.url, err);
        this.handle(request, err);
        return throwError(err);
      }),
    );
  }

  private handle(request: HttpRequest<any>, err: any) {
    if (request.url.endsWith('/token') || request.url.endsWith('/auth')) {
      return;
    }
    if (err.status === 401) {
      // auto logout if 401 response returned from api
      this.Logout$.emit().subscribe(() => {
        location.reload(true);
      });
    } else if (err.status === 400) {
      this.getErrorMsg(err).subscribe(it => {
        this.snackBar.open(it, 'OK', {
          duration: 0,
        });
      });
    }
  }

  private getErrorMsg(err: any): Observable<string> {
    const error = err.error.message || err.statusText;
    return this.translate.get(error);
  }

  showError(err: string | any, action?: string, config?: MatSnackBarConfig) {
    if (isString(err)) {
      this.translate.get(err).subscribe(res => this.snackBar.open(res, action || 'X', config));
      return;
    } else if (err instanceof HttpErrorResponse) {
      if (err.error && err.error.errorCode) {
        this.translate.get(`Error.${err.error.errorCode}`)
          .subscribe(it => this.showError(it));
      }
      if (err.error && err.error.errorMessage) {
        this.translate.get(err.error.errorMessage)
          .subscribe(it => this.showError(it));
      }
    } else if (err instanceof Error) {
      const error = err as Error;
      this.translate.get(error.message).subscribe(it => this.showError(it));
    }
  }

}
