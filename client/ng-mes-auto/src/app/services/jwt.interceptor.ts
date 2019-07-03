import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {EmitterService} from '@ngxs-labs/emitter';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AppState} from '../store/app.state';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private store: Store,
              private emitter: EmitterService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.store.selectSnapshot(AppState.isLoading)) {
      this.emitter.action(AppState.SetLoading).emit(true);
    }
    const tokenReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.store.selectSnapshot(AppState.token)}`
      }
    });
    return next.handle(tokenReq);
  }
}
