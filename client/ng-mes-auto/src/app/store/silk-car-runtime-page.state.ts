import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiService} from '../services/api.service';

const PAGE_NAME = 'SilkCarRuntimePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { code: string }) {
  }
}

export class FetchAction {
  static readonly type = `[${PAGE_NAME}] FetchAction`;

  constructor(public payload: string) {
  }
}

interface StateModel {
  silkCarRuntime?: SilkCarRuntime;
  settingForm?: { model: { sort: string } };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {},
})
export class SilkCarRuntimePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRuntime(state: StateModel) {
    return state.silkCarRuntime;
  }

  @Receiver()
  static OnInit({setState}: StateContext<StateModel>, action: EmitterAction<void>) {
    setState({});
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch}: StateContext<StateModel>, {payload: {code}}: InitAction) {
    if (code) {
      return dispatch(new FetchAction(code));
    }
  }

  @Action(FetchAction)
  @ImmutableContext()
  FetchAction({setState, patchState, dispatch}: StateContext<StateModel>, {payload}: FetchAction) {
    setState((state: StateModel) => {
      state = {};
      return state;
    });
    return this.api.getSilkCarRuntimeByCode(payload).pipe(
      tap(silkCarRuntime => setState((state: StateModel) => {
        state.silkCarRuntime = silkCarRuntime;
        return state;
      })),
    );
  }

}
