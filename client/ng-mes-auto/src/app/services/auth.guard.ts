import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngxs/store';
import {isNullOrUndefined} from 'util';
import {AppState} from '../store/app.state';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = this.store.selectSnapshot(AppState.token);
    if (isNullOrUndefined(token)) {
      this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
      return false;
    }
    return true;
  }
}
