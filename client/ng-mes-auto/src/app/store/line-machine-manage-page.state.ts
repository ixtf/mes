import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Line} from '../models/line';
import {LineMachine} from '../models/line-machine';
import {ApiService} from '../services/api.service';
import {LineMachineCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[LineMachineManagePage] InitAction';
}

export class QueryAction {
  static readonly type = '[LineMachineManagePage] QueryAction';

  constructor(public payload: { line: Line; }) {
  }
}

interface StateModel {
  line?: Line;
  lineMachineEntities: { [id: string]: LineMachine };
}

@State<StateModel>({
  name: 'LineMachineManagePage',
  defaults: {
    lineMachineEntities: {},
  }
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
    return Object.values(state.lineMachineEntities).sort(LineMachineCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState, getState}: StateContext<StateModel>, {payload: {line}}: QueryAction) {
    const oldLine = getState().line;
    if ((oldLine && oldLine.id) !== line.id) {
      return this.api.getLine_LineMachines(line.id).pipe(
        tap(lineMachines => setState((state: StateModel) => {
          state.line = line;
          state.lineMachineEntities = LineMachine.toEntities(lineMachines);
          return state;
        }))
      );
    }
  }

}
