import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AppState} from '../store/app.state';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private store: Store) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.store.selectSnapshot(AppState.token)}`
      }
    });
    return next.handle(tokenReq);
  }
}
