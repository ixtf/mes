import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AppState} from '../store/app.state';

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;

  constructor(private store: Store) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.isAdmin$;
  }
}
