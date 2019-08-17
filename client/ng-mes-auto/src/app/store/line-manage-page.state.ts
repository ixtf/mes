import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {Line} from '../models/line';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CODE_COMPARE, LINE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'LineManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; }) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: Line) {
  }
}

interface StateModel {
  workshopId?: string;
  workshopEntities: { [id: string]: Workshop };
  lineEntities: { [id: string]: Line };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
    lineEntities: {},
  },
})
export class LineManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshop(state: StateModel): Workshop {
    return state.workshopEntities[state.workshopId];
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static lines(state: StateModel): Line[] {
    return Object.values(state.lineEntities).sort(LINE_COMPARE);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({getState, setState, dispatch}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      switchMap(workshops => {
        setState((state: StateModel) => {
          state.workshopEntities = Workshop.toEntities(workshops);
          return state;
        });
        const workshopId = LineManagePageState.workshopId(getState()) || LineManagePageState.workshops(getState())[0].id;
        return dispatch(new QueryAction({workshopId}));
      }),
    );
  }

  @Action(QueryAction, {cancelUncompleted: true})
  @ImmutableContext()
  QueryAction({getState, setState}: StateContext<StateModel>, {payload: {workshopId}}: QueryAction) {
    let fetch = false;
    if (LineManagePageState.lines(getState()).length < 1) {
      fetch = true;
    } else {
      const oldWorkshopId = LineManagePageState.workshopId(getState());
      fetch = oldWorkshopId !== workshopId;
    }
    return this.api.getWorkshop_Lines(workshopId).pipe(
      tap(lines => setState((state: StateModel) => {
        state.lineEntities = Line.toEntities(lines);
        state.workshopId = workshopId;
        return state;
      })),
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveLine(payload).pipe(
      tap(line => setState((state: StateModel) => {
        state.lineEntities[line.id] = line;
        return state;
      })),
    );
  }

}
