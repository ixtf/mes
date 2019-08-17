import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {ExceptionRecord} from '../models/exception-record';
import {Line} from '../models/line';
import {ApiService} from '../services/api.service';
import {LINE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'ExceptionRecordManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class HandleAction {
  static readonly type = `[${PAGE_NAME}] HandleAction`;

  constructor(public payload: ExceptionRecord) {
  }
}

export class EBUpdateExceptionRecordAction {
  static readonly type = `[${PAGE_NAME}] EBUpdateExceptionRecordAction`;

  constructor(public payload: { exceptionRecord: ExceptionRecord }) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: ExceptionRecord) {
  }
}

export class FilterLineAction {
  static readonly type = `[${PAGE_NAME}] FilterLineAction`;

  constructor(public payload: Line) {
  }
}

interface StateModel {
  filterLine?: Line;
  exceptionRecordEntities: { [id: string]: ExceptionRecord };
}

@State<StateModel>({
  name: PAGE_NAME,
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
    return Object.values(lineMap).sort(LINE_COMPARE);
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
          state.exceptionRecordEntities[exceptionRecord.id] = ExceptionRecord.assign(exceptionRecord);
          return state;
        });
        return dispatch(new FilterLineAction(exceptionRecord.lineMachine.line));
      }),
    );
  }

  @Action(EBUpdateExceptionRecordAction)
  @ImmutableContext()
  EBUpdateExceptionRecordAction({setState, dispatch}: StateContext<StateModel>, {payload: {exceptionRecord}}: EBUpdateExceptionRecordAction) {
    setState((state: StateModel) => {
      if (exceptionRecord.handled) {
        delete state.exceptionRecordEntities[exceptionRecord.id];
      } else {
        state.exceptionRecordEntities[exceptionRecord.id] = ExceptionRecord.assign(exceptionRecord);
      }
      return state;
    });
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
