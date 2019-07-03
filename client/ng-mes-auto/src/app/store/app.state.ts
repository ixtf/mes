import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {Navigate} from '@ngxs/router-plugin';
import {Action, NgxsOnInit, Selector, State, StateContext} from '@ngxs/store';
import {forkJoin, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {AuthInfo} from '../models/auth-info';
import {Corporation} from '../models/corporation';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[App] InitAction';
}

export class LoginAction {
  static readonly type = '[App] LoginAction';

  constructor(public payload: { loginId: string; loginPassword: string; returnUrl: string; }) {
  }
}

interface AppStateModel {
  shake?: boolean;
  loading?: boolean;
  token?: string;
  authInfo?: AuthInfo;
  corporations?: Corporation[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {}
})
export class AppState implements NgxsOnInit {
  constructor(private apiService: ApiService) {
  }

  @Selector()
  static isShake(state: AppStateModel): boolean {
    return state.shake;
  }

  @Selector()
  static isLoading(state: AppStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static token(state: AppStateModel): string {
    return state.token;
  }

  @Selector()
  static authInfo(state: AppStateModel): AuthInfo {
    return state.authInfo;
  }

  @Selector()
  static corporation(state: AppStateModel): Corporation {
    return state.corporations && state.corporations[0];
  }

  @Selector()
  static isAdmin(state: AppStateModel): boolean {
    return state.authInfo && state.authInfo.admin;
  }

  @Receiver()
  static SetLoading({patchState}: StateContext<AppStateModel>, {payload}: EmitterAction<boolean>) {
    patchState({loading: payload});
  }

  @Receiver()
  static LogoutAction({setState}: StateContext<AppStateModel>) {
    setState({});
    location.reload();
    // return dispatch(new Navigate(['/']));
  }

  ngxsOnInit({dispatch}: StateContext<AppStateModel>) {
    dispatch(new InitAction());
  }

  @Action(InitAction)
  InitAction({patchState}: StateContext<AppStateModel>) {
    const authInfo$ = this.apiService.authInfo();
    const corporations$ = this.apiService.listCorporation();
    return forkJoin(authInfo$, corporations$).pipe(
      tap(([authInfo, corporations]) => patchState({authInfo, corporations}))
    );
  }

  @Action(LoginAction)
  LoginAction({getState, patchState, dispatch}: StateContext<AppStateModel>, {payload}: LoginAction) {
    return this.apiService.token(payload).pipe(
      switchMap(token => {
        patchState({token});
        const initAction = new InitAction();
        const navigateAction = new Navigate([payload.returnUrl || '/']);
        return dispatch([initAction, navigateAction]);
      }),
      catchError(() => {
        patchState({shake: !getState().shake});
        return of();
      })
    );
  }
}
