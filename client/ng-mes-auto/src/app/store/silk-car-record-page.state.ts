import {EmitterAction, Receiver} from '@ngxs-labs/emitter';
import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {SilkCarRecord} from '../models/silk-car-record';
import {ApiService} from '../services/api.service';

interface SilkCarRecordPageStateModel {
  silkCarRecords?: SilkCarRecord[];
}

export class QueryAction {
  static readonly type = '[SilkCarRecordPage] QueryAction';

  constructor(public payload: { startDate: Date, endDate: Date, silkCarId: string }) {
  }
}

@State<SilkCarRecordPageStateModel>({
  name: 'SilkCarRecordPage',
  defaults: {}
})
export class SilkCarRecordPageState {
  constructor(private apiService: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRecords(state: SilkCarRecordPageStateModel) {
    return state.silkCarRecords;
  }

  @Receiver()
  static OnInit({setState}: StateContext<SilkCarRecordPageStateModel>, action: EmitterAction<void>) {
    setState({});
  }

  @Action(QueryAction)
  QueryAction({patchState, dispatch}: StateContext<SilkCarRecordPageStateModel>, {payload}: QueryAction) {
    // return this.apiService.getSilkCarRuntimeByCode(payload).pipe(
    //   tap(silkCarRuntime => patchState({silkCarRuntime})),
    // );
  }

}
