import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AppState} from '../pages/app/app.state';

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  @Select(AppState.authInfoIsAdmin)
  readonly isAdmin$: Observable<boolean>;

  constructor(private store: Store) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.isAdmin$;
  }
}
