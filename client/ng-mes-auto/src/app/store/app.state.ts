import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Navigate} from '@ngxs/router-plugin';
import {Action, NgxsOnInit, Selector, State, StateContext} from '@ngxs/store';
import {of} from 'rxjs';
import {catchError, concatMap, switchMap, tap} from 'rxjs/operators';
import {AuthInfo} from '../models/auth-info';
import {Corporation} from '../models/corporation';
import {ApiService} from '../services/api.service';

const PAGE_NAME = 'App';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class LoginAction {
  static readonly type = `[${PAGE_NAME}] LoginAction`;

  constructor(public payload: { loginId: string; loginPassword: string; returnUrl: string; }) {
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
  defaults: {}
})
export class AppState implements NgxsOnInit {
  constructor(private api: ApiService) {
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

  @Receiver()
  @ImmutableContext()
  static SetLoading({setState}: StateContext<StateModel>, {payload}: EmitterAction<boolean>) {
    setState((state: StateModel) => {
      state.loading = payload;
      return state;
    });
  }

  @Receiver()
  static LogoutAction({setState}: StateContext<StateModel>) {
    setState({});
    location.reload();
    // return dispatch(new Navigate(['/']));
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
      }))
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
      }),
      catchError(() => {
        setState((state: StateModel) => {
          state.shake = !state.shake;
          return state;
        });
        return of();
      })
    );
  }
}
