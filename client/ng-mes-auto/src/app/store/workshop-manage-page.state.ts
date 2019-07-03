import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CodeCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[WorkshopManagePage] InitAction';
}

interface WorkshopManagePageStateModel {
  q?: string;
  workshops?: Workshop[];
}

@State<WorkshopManagePageStateModel>({
  name: 'WorkshopManagePage',
  defaults: {}
})
export class WorkshopManagePageState {
  constructor(private apiService: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: WorkshopManagePageStateModel) {
    return (state.workshops || []).sort(CodeCompare);
  }

  @Action(InitAction)
  InitAction({patchState}: StateContext<WorkshopManagePageStateModel>) {
    return this.apiService.listWorkshop().pipe(
      tap(workshops => patchState({workshops}))
    );
  }

}
