import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CodeCompare} from '../services/util.service';

const PAGE_NAME = 'WorkshopManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] ${InitAction.name}`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] ${SaveAction.name}`;

  constructor(public payload: Workshop) {
  }
}

interface StateModel {
  q?: string;
  workshopEntities?: { [id: string]: Workshop };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {}
  }
})
export class WorkshopManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel) {
    return Object.values(state.workshopEntities).sort(CodeCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      tap(workshops => setState((state: StateModel) => {
        state.workshopEntities = Workshop.toEntities(workshops);
        return state;
      }))
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveWorkshop(payload).pipe(
      tap(workshop => setState((state: StateModel) => {
        state.workshopEntities[workshop.id] = workshop;
        return state;
      }))
    );
  }

}
