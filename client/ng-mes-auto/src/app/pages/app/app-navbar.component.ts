import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Emittable, Emitter} from '@ngxs-labs/emitter';
import {Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {AuthInfo} from '../../models/auth-info';
import {AppState} from '../../store/app.state';

@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavbarComponent {
  @Select(AppState.isLoading)
  readonly isLoading$: Observable<boolean>;
  @Select(AppState.authInfo)
  readonly authInfo$: Observable<AuthInfo>;
  @Select(AppState.isAdmin)
  readonly isAdmin$: Observable<boolean>;
  @Emitter(AppState.LogoutAction)
  readonly logout$: Emittable;

}
