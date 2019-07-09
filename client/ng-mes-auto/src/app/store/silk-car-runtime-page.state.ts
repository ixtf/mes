import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiService} from '../services/api.service';

export class FetchAction {
  static readonly type = '[SilkCarRuntimePage] FetchAction';

  constructor(public payload: string) {
  }
}

interface SilkCarRuntimePageStateModel {
  silkCarRuntime?: SilkCarRuntime;
  settingForm?: { model: { sort: string } };
}

@State<SilkCarRuntimePageStateModel>({
  name: 'SilkCarRuntimePage',
  defaults: {}
})
export class SilkCarRuntimePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRuntime(state: SilkCarRuntimePageStateModel) {
    return state.silkCarRuntime;
  }

  @Receiver()
  static OnInit({setState}: StateContext<SilkCarRuntimePageStateModel>, action: EmitterAction<void>) {
    setState({});
  }

  @Action(FetchAction)
  @ImmutableContext()
  FetchAction({setState, patchState, dispatch}: StateContext<SilkCarRuntimePageStateModel>, {payload}: FetchAction) {
    setState((state: SilkCarRuntimePageStateModel) => {
      state = {};
      return state;
    });
    return this.api.getSilkCarRuntimeByCode(payload).pipe(
      tap(silkCarRuntime => setState((state: SilkCarRuntimePageStateModel) => {
        state.silkCarRuntime = silkCarRuntime;
        return state;
      })),
    );
  }

}
