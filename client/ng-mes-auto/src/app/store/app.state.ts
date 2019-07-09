import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
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
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static isShake(state: AppStateModel): boolean {
    return state.shake;
  }

  @Selector()
  @ImmutableSelector()
  static isLoading(state: AppStateModel): boolean {
    return state.loading;
  }

  @Selector()
  @ImmutableSelector()
  static token(state: AppStateModel): string {
    return state.token;
  }

  @Selector()
  @ImmutableSelector()
  static authInfo(state: AppStateModel): AuthInfo {
    return state.authInfo;
  }

  @Selector()
  @ImmutableSelector()
  static corporation(state: AppStateModel): Corporation {
    return state.corporations && state.corporations[0];
  }

  @Selector()
  @ImmutableSelector()
  static isAdmin(state: AppStateModel): boolean {
    return state.authInfo && state.authInfo.admin;
  }

  @Receiver()
  @ImmutableContext()
  static SetLoading({setState}: StateContext<AppStateModel>, {payload}: EmitterAction<boolean>) {
    setState((state: AppStateModel) => {
      state.loading = payload;
      return state;
    });
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
  @ImmutableContext()
  InitAction({setState}: StateContext<AppStateModel>) {
    const authInfo$ = this.api.authInfo();
    const corporations$ = this.api.listCorporation();
    return forkJoin([authInfo$, corporations$]).pipe(
      tap(([authInfo, corporations]) => setState((state: AppStateModel) => {
        state.authInfo = authInfo;
        state.corporations = corporations;
        return state;
      }))
    );
  }

  @Action(LoginAction)
  @ImmutableContext()
  LoginAction({getState, setState, dispatch}: StateContext<AppStateModel>, {payload}: LoginAction) {
    return this.api.token(payload).pipe(
      switchMap(token => {
        setState((state: AppStateModel) => {
          state.token = token;
          return state;
        });
        const initAction = new InitAction();
        const navigateAction = new Navigate([payload.returnUrl || '/']);
        return dispatch([initAction, navigateAction]);
      }),
      catchError(() => {
        setState((state: AppStateModel) => {
          state.shake = !state.shake;
          return state;
        });
        return of();
      })
    );
  }
}
