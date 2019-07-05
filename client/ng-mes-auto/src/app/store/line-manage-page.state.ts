import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
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
  constructor(private apiService: ApiService) {
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
  InitAction({getState, patchState, dispatch}: StateContext<LineManagePageStateModel>) {
    return this.apiService.listWorkshop().pipe(
      switchMap(workshops => {
        workshops = workshops.sort(CodeCompare);
        patchState({workshops});
        return dispatch(new QueryAction({workshopId: getState().workshopId || workshops[0].id}));
      })
    );
  }

  @Action(QueryAction)
  QueryAction({getState, patchState}: StateContext<LineManagePageStateModel>, {payload: {workshopId}}: QueryAction) {
    if (getState().workshopId !== workshopId) {
      return this.apiService.getWorkshop_Lines(workshopId).pipe(
        tap(lines => patchState({workshopId, lines}))
      );
    }
  }

}
