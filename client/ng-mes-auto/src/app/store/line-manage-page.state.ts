import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {Line} from '../models/line';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CodeCompare, LineCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[LineManagePage] InitAction';
}

export class QueryAction {
  static readonly type = '[LineManagePage] QueryAction';

  constructor(public payload: { workshopId?: string; }) {
  }
}

interface LineManagePageStateModel {
  workshopId?: string;
  workshops?: Workshop[];
  lines?: Line[];
  searchForm: any;
}

@State<LineManagePageStateModel>({
  name: 'LineManagePage',
  defaults: {
    searchForm: {
      model: undefined,
      dirty: false,
      status: '',
      errors: {}
    }
  }
})
export class LineManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: LineManagePageStateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: LineManagePageStateModel): Workshop[] {
    return state.workshops;
  }

  @Selector()
  @ImmutableSelector()
  static lines(state: LineManagePageStateModel): Line[] {
    return (state.lines || []).sort(LineCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({getState, setState, dispatch}: StateContext<LineManagePageStateModel>) {
    return this.api.listWorkshop().pipe(
      switchMap(workshops => {
        workshops = workshops.sort(CodeCompare);
        setState((state: LineManagePageStateModel) => {
          state.workshops = workshops;
          return state;
        });
        return dispatch(new QueryAction({workshopId: getState().workshopId || workshops[0].id}));
      })
    );
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({getState, setState}: StateContext<LineManagePageStateModel>, {payload: {workshopId}}: QueryAction) {
    if (getState().workshopId !== workshopId) {
      return this.api.getWorkshop_Lines(workshopId).pipe(
        tap(lines => setState((state: LineManagePageStateModel) => {
          state.lines = lines;
          state.workshopId = workshopId;
          return state;
        }))
      );
    }
  }

}
