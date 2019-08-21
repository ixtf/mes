import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {TemporaryBox} from '../models/temporary-box';
import {ApiService} from '../services/api.service';
import {CODE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'TemporaryBoxManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { first: number; pageSize: number; }) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: TemporaryBox) {
  }
}

interface StateModel {
  count?: number;
  first?: number;
  pageSize?: number;
  q?: string;
  temporaryBoxEntities?: { [id: string]: TemporaryBox };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    temporaryBoxEntities: {},
  },
})
export class TemporaryBoxManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static temporaryBoxes(state: StateModel): TemporaryBox[] {
    return Object.values(state.temporaryBoxEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static count(state: StateModel): number {
    return state.count;
  }

  @Selector()
  @ImmutableSelector()
  static pageIndex(state: StateModel): number {
    return state.first / state.pageSize;
  }

  @Selector()
  @ImmutableSelector()
  static pageSize(state: StateModel): number {
    return state.pageSize;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch}: StateContext<StateModel>) {
    return dispatch(new QueryAction({first: 0, pageSize: 50}));
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload}: QueryAction) {
    return this.api.listTemporaryBox().pipe(
      tap(temporaryBoxes => setState((state: StateModel) => {
        state.temporaryBoxEntities = TemporaryBox.toEntities(temporaryBoxes);
        return state;
      })),
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    // return this.api.saveWorkshop(payload).pipe(
    //   tap(workshop => setState((state: StateModel) => {
    //     state.workshopEntities[workshop.id] = workshop;
    //     return state;
    //   })),
    // );
  }

}
