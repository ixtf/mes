import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CodeCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[WorkshopManagePage] InitAction';
}

interface StateModel {
  q?: string;
  workshops?: Workshop[];
}

@State<StateModel>({
  name: 'WorkshopManagePage',
  defaults: {}
})
export class WorkshopManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel) {
    return (state.workshops || []).sort(CodeCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      tap(workshops => setState((state: StateModel) => {
        state.workshops = workshops;
        return state;
      }))
    );
  }

}
