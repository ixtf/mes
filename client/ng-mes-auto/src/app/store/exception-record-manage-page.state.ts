import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {ExceptionRecord} from '../models/exception-record';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[ExceptionRecordManagePage] InitAction';
}

export class HandleAction {
  static readonly type = '[ExceptionRecordManagePage] HandleAction';

  constructor(public payload: ExceptionRecord) {
  }
}

interface ExceptionRecordManagePageStateModel {
  exceptionRecords?: ExceptionRecord[];
}

@State<ExceptionRecordManagePageStateModel>({
  name: 'ExceptionRecordManagePage',
  defaults: {}
})
export class ExceptionRecordManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static exceptionRecords(state: ExceptionRecordManagePageStateModel) {
    // return (state.exceptionRecords || []).sort(CodeCompare);
    return (state.exceptionRecords || []).filter(it => !it.handleDateTime);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<ExceptionRecordManagePageStateModel>) {
    return this.api.listExceptionRecord().pipe(
      tap(exceptionRecords => setState((state: ExceptionRecordManagePageStateModel) => {
        state.exceptionRecords = exceptionRecords;
        return state;
      }))
    );
  }

  @Action(HandleAction)
  @ImmutableContext()
  HandleAction({setState}: StateContext<ExceptionRecordManagePageStateModel>, {payload}: HandleAction) {
    return this.api.handleExceptionRecord(payload.id).pipe(
      tap(() => setState((state: ExceptionRecordManagePageStateModel) => {
        state.exceptionRecords = (state.exceptionRecords || []).filter(it => it.id !== payload.id);
        return state;
      }))
    );
  }

}
