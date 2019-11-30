import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {EmitterService} from '@ngxs-labs/emitter';
import {Store} from '@ngxs/store';
import {Observable, of, throwError} from 'rxjs';
import {catchError, finalize} from 'rxjs/operators';
import {isString} from 'util';
import {AppState} from '../pages/app/app.state';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private store: Store,
              private emitter: EmitterService,
              private snackBar: MatSnackBar,
              private translate: TranslateService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.log('ErrorInterceptor', request.url, err);
        this.handle(request, err);
        return throwError(err);
      }),
      finalize(() => {
        if (this.store.selectSnapshot(AppState.isLoading)) {
          this.emitter.action(AppState.SetLoading).emit(false);
        }
      })
    );
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

  private handle(request: HttpRequest<any>, err: any) {
    if (request.url.endsWith('/token') || request.url.endsWith('/auth')) {
      return;
    }
    if (err.status === 401) {
      // auto logout if 401 response returned from api
      this.emitter.action(AppState.LogoutAction).emit().subscribe(() => {
        location.reload(true);
      });
    } else {
      this.getErrorMsg(err).subscribe(it => {
        this.snackBar.open(it, 'OK', {
          duration: 0,
        });
      });
    }
  }

  private getErrorMsg(err: any): Observable<string> {
    if (err.status === 400) {
      const error = err.error.errorMessage || err.statusText;
      return this.translate.get(error);
    }
    return of([err.status, err.statusText, err.error.message].join(':'));
  }

}
