import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Navigate} from '@ngxs/router-plugin';
import {Action, NgxsOnInit, Selector, State, StateContext} from '@ngxs/store';
import {of} from 'rxjs';
import {catchError, concatMap, switchMap, tap} from 'rxjs/operators';
import {AuthInfo} from '../../models/auth-info';
import {Corporation} from '../../models/corporation';
import {ApiService} from '../../services/api.service';

const PAGE_NAME = 'App';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class LoginAction {
  static readonly type = `[${PAGE_NAME}] LoginAction`;

  constructor(public payload: { loginId: string; loginPassword: string; returnUrl: string; }) {
  }
}

export class LogoutAction {
  static readonly type = `[${PAGE_NAME}] LogoutAction`;
}

export class SetLoadingAction {
  static readonly type = `[${PAGE_NAME}] SetLoadingAction`;

  constructor(public payload: boolean) {
  }
}

export class ShowErrorAction {
  static readonly type = `[${PAGE_NAME}] ShowErrorAction`;

  constructor(public payload: { error: Error; params?: any; }) {
  }
}

export class ShowErrorByCodeAction {
  static readonly type = `[${PAGE_NAME}] ShowErrorByCodeAction`;

  constructor(public payload: { code: string; params?: any; }) {
  }
}

interface StateModel {
  shake?: boolean;
  loading?: boolean;
  token?: string;
  authInfo?: AuthInfo;
  corporations?: Corporation[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {},
})
@Injectable()
export class AppState implements NgxsOnInit {
  constructor(private api: ApiService,
              private router: Router,
              private translate: TranslateService,
              private snackBar: MatSnackBar) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.token`];
  }

  @Selector()
  @ImmutableSelector()
  static isShake(state: StateModel): boolean {
    return state.shake;
  }

  @Selector()
  @ImmutableSelector()
  static isLoading(state: StateModel): boolean {
    return state.loading;
  }

  @Selector()
  @ImmutableSelector()
  static token(state: StateModel): string {
    return state.token;
  }

  @Selector()
  @ImmutableSelector()
  static authInfo(state: StateModel): AuthInfo {
    return state.authInfo;
  }

  @Selector()
  @ImmutableSelector()
  static authInfoId(state: StateModel): string {
    return state.authInfo && state.authInfo.id;
  }

  @Selector()
  @ImmutableSelector()
  static authInfoIsAdmin(state: StateModel): boolean {
    return state.authInfo && state.authInfo.admin;
  }

  @Selector()
  @ImmutableSelector()
  static corporation(state: StateModel): Corporation {
    return state.corporations && state.corporations[0];
  }

  ngxsOnInit({dispatch}: StateContext<StateModel>) {
    dispatch(new InitAction());
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.authInfo().pipe(
      concatMap(authInfo => {
        setState((state: StateModel) => {
          state.authInfo = authInfo;
          return state;
        });
        return this.api.listCorporation();
      }),
      tap(corporations => setState((state: StateModel) => {
        state.corporations = corporations;
        return state;
      })),
    );
  }

  @Action(LoginAction)
  @ImmutableContext()
  LoginAction({getState, setState, dispatch}: StateContext<StateModel>, {payload}: LoginAction) {
    return this.api.token(payload).pipe(
      switchMap(token => {
        setState((state: StateModel) => {
          state.token = token;
          return state;
        });
        const initAction = new InitAction();
        const navigateAction = new Navigate([payload.returnUrl || '/']);
        return dispatch([initAction, navigateAction]);

        // return dispatch(new InitAction());
      }),
      // tap(() => {
      //   this.router.navigateByUrl(payload.returnUrl || '/');
      // }),
      catchError(() => {
        setState((state: StateModel) => {
          state.shake = !state.shake;
          return state;
        });
        return of();
      }),
    );
  }

  @Action(LogoutAction)
  LogoutAction({setState}: StateContext<StateModel>) {
    setState({});
    location.reload();
  }

  @Action(SetLoadingAction)
  @ImmutableContext()
  SetLoadingAction({setState}: StateContext<StateModel>, {payload}: SetLoadingAction) {
    setState((state: StateModel) => {
      state.loading = payload;
      return state;
    });
  }

  @Action(ShowErrorAction)
  @ImmutableContext()
  ShowErrorAction({getState, setState, dispatch}: StateContext<StateModel>, {payload: {error, params}}: ShowErrorAction) {
    return dispatch(new ShowErrorByCodeAction({code: error.message, params}));
  }

  @Action(ShowErrorByCodeAction)
  @ImmutableContext()
  ShowErrorByCodeAction({getState, setState, dispatch}: StateContext<StateModel>, {payload: {code, params}}: ShowErrorByCodeAction) {
    params = params || {};
    return this.translate.get(code, params).pipe(
      tap(it => this.snackBar.open(it, 'OK')),
      catchError(err => {
        console.error('ShowErrorByCodeAction', err);
        return of();
      }),
    );
  }
}
