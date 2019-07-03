import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngxs/store';
import {AppState} from '../store/app.state';

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(private store: Store) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.selectSnapshot(AppState.isAdmin);
  }
}
