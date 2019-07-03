import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {Navigate} from '@ngxs/router-plugin';
import {Action, NgxsOnInit, Selector, State, StateContext} from '@ngxs/store';
import {of} from 'rxjs';
import {catchError, concatMap, tap} from 'rxjs/operators';
import {AuthInfo} from '../models/auth-info';
import {ApiService} from '../services/api.service';

interface AppStateModel {
  shake?: boolean;
  loading?: boolean;
  token?: string;
  authInfo?: AuthInfo;
}

export class LoginAction {
  static readonly type = '[App] LoginAction';

  constructor(public payload: {
    loginId: string;
    loginPassword: string;
    returnUrl: string;
  }) {
  }
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
  static isAdmin(state: AppStateModel): boolean {
    return state.authInfo && state.authInfo.admin;
  }

  @Receiver()
  static SetLoading({patchState}: StateContext<AppStateModel>, {payload}: EmitterAction<boolean>) {
    patchState({loading: payload});
  }

  @Receiver()
  static LogoutAction({setState, dispatch}: StateContext<AppStateModel>, action: EmitterAction<void>) {
    setState({});
    location.reload();
    // return dispatch(new Navigate(['/']));
  }

  ngxsOnInit(ctx: StateContext<any>) {
    return this.fetchAuthInfo(ctx).subscribe();
  }

  private fetchAuthInfo(ctx: StateContext<any>) {
    const {patchState} = ctx;
    return this.apiService.authInfo().pipe(
      tap(authInfo => patchState({authInfo})),
    );
  }

  @Action(LoginAction)
  LoginAction(ctx: StateContext<AppStateModel>, {payload}: LoginAction) {
    const {getState, patchState, dispatch} = ctx;
    return this.apiService.token(payload).pipe(
      tap(token => patchState({token})),
      concatMap(() => this.fetchAuthInfo(ctx)),
      concatMap(() => dispatch(new Navigate([payload.returnUrl || '/']))),
      catchError(() => {
        patchState({shake: !getState().shake});
        return of();
      })
    );
  }
}
