import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiService} from '../services/api.service';

interface SilkCarRuntimePageStateModel {
  silkCarRuntime?: SilkCarRuntime;
  settingForm?: { model: { sort: string } };
}

export class FetchAction {
  static readonly type = '[SilkCarRuntimePage] FetchAction';

  constructor(public payload: string) {
  }
}

@State<SilkCarRuntimePageStateModel>({
  name: 'SilkCarRuntimePage',
  defaults: {}
})
export class SilkCarRuntimePageState {
  constructor(private apiService: ApiService) {
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
  FetchAction({setState, patchState, dispatch}: StateContext<SilkCarRuntimePageStateModel>, {payload}: FetchAction) {
    setState({});
    return this.apiService.getSilkCarRuntimeByCode(payload).pipe(
      tap(silkCarRuntime => patchState({silkCarRuntime})),
    );
  }

}
