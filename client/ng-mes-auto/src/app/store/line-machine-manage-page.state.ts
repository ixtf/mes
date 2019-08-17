import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {Line} from '../models/line';
import {LineMachine} from '../models/line-machine';
import {ApiService} from '../services/api.service';
import {LINE_MACHINE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'LineMachineManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { line: Line; }) {
  }
}

interface StateModel {
  line?: Line;
  lineMachineEntities: { [id: string]: LineMachine };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    lineMachineEntities: {},
  },
})
export class LineMachineManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static line(state: StateModel): Line {
    return state.line;
  }

  @Selector()
  @ImmutableSelector()
  static lineMachines(state: StateModel): LineMachine[] {
    return Object.values(state.lineMachineEntities).sort(LINE_MACHINE_COMPARE);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch}: StateContext<StateModel>) {
    const lineId = localStorage.getItem(`${PAGE_NAME}.lineId`);
    if (lineId) {
      return this.api.getLine(lineId).pipe(
        switchMap(line => dispatch(new QueryAction({line}))),
      );
    }
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState, getState}: StateContext<StateModel>, {payload: {line}}: QueryAction) {
    const oldLine = getState().line;
    if ((oldLine && oldLine.id) !== line.id) {
      localStorage.setItem(`${PAGE_NAME}.lineId`, line.id);
      return this.api.getLine_LineMachines(line.id).pipe(
        tap(lineMachines => setState((state: StateModel) => {
          state.line = line;
          state.lineMachineEntities = LineMachine.toEntities(lineMachines);
          return state;
        })),
      );
    }
  }

}
