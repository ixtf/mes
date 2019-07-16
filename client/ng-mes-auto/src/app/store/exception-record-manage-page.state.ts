import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {ExceptionRecord} from '../models/exception-record';
import {Line} from '../models/line';
import {ApiService} from '../services/api.service';
import {LineCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[ExceptionRecordManagePage] InitAction';
}

export class HandleAction {
  static readonly type = '[ExceptionRecordManagePage] HandleAction';

  constructor(public payload: ExceptionRecord) {
  }
}

export class SaveAction {
  static readonly type = '[ExceptionRecordManagePage] SaveAction';

  constructor(public payload: ExceptionRecord) {
  }
}

export class FilterLineAction {
  static readonly type = '[ExceptionRecordManagePage] FilterLineAction';

  constructor(public payload: Line) {
  }
}

interface StateModel {
  filterLine?: Line;
  exceptionRecordEntities: { [id: string]: ExceptionRecord };
}

@State<StateModel>({
  name: 'ExceptionRecordManagePage',
  defaults: {
    exceptionRecordEntities: {}
  }
})
export class ExceptionRecordManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static exceptionRecords(state: StateModel): ExceptionRecord[] {
    return Object.values(state.exceptionRecordEntities).filter(it => {
      if (state.filterLine) {
        return it.lineMachine.line.id === state.filterLine.id;
      }
      return true;
    });
  }

  @Selector()
  @ImmutableSelector()
  static filterLine(state: StateModel): Line {
    return state.filterLine;
  }

  @Selector()
  @ImmutableSelector()
  static lines(state: StateModel): Line[] {
    const lineMap: { [id: string]: Line } = {};
    Object.values(state.exceptionRecordEntities).forEach(it => {
      const line = it.lineMachine.line;
      lineMap[line.id] = line;
    });
    return Object.values(lineMap).sort(LineCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listExceptionRecord().pipe(
      tap(exceptionRecords => setState((state: StateModel) => {
        state = {exceptionRecordEntities: {}};
        state.exceptionRecordEntities = ExceptionRecord.toEntities(exceptionRecords);
        return state;
      }))
    );
  }

  @Action(HandleAction)
  @ImmutableContext()
  HandleAction({setState}: StateContext<StateModel>, {payload}: HandleAction) {
    return this.api.handleExceptionRecord(payload.id).pipe(
      tap(() => setState((state: StateModel) => {
        delete state.exceptionRecordEntities[payload.id];
        return state;
      }))
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState, dispatch}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveExceptionRecord(payload).pipe(
      switchMap(exceptionRecord => {
        setState((state: StateModel) => {
          state.exceptionRecordEntities[exceptionRecord.id] = exceptionRecord;
          return state;
        });
        return dispatch(new FilterLineAction(exceptionRecord.lineMachine.line));
      }),
    );
  }

  @Action(FilterLineAction)
  @ImmutableContext()
  FilterLineAction({setState}: StateContext<StateModel>, {payload}: FilterLineAction) {
    setState((state: StateModel) => {
      state.filterLine = payload;
      return state;
    });
  }

}
