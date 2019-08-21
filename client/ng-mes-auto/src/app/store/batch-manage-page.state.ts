import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Batch} from '../models/batch';
import {ApiService} from '../services/api.service';

const PAGE_NAME = 'BatchManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: Batch) {
  }
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { first: number; pageSize: number; }) {
  }
}

export class SetQAction {
  static readonly type = `[${PAGE_NAME}] SetQAction`;

  constructor(public payload: string) {
  }
}

interface StateModel {
  count?: number;
  first?: number;
  pageSize?: number;
  q?: string;
  batchEntities: { [id: string]: Batch };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    batchEntities: {},
  }
})
export class BatchManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: StateModel): Batch[] {
    return Object.values(state.batchEntities);
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
  QueryAction({setState}: StateContext<StateModel>, {payload: {first, pageSize}}: QueryAction) {
    const params = new HttpParams().set('first', `${first}`).set('pageSize', `${pageSize}`);
    return this.api.listBatch(params).pipe(
      tap(({count, batches}) => setState((state: StateModel) => {
        state.count = count;
        state.first = first;
        state.pageSize = pageSize;
        state.batchEntities = Batch.toEntities(batches);
        return state;
      })),
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveBatch(payload).pipe(
      tap(batch => setState((state: StateModel) => {
        batch = Batch.assign(batch);
        state.batchEntities [batch.id] = batch;
        return state;
      })),
    );
  }

  @Action(SetQAction)
  @ImmutableContext()
  SetQAction({setState}: StateContext<StateModel>, {payload}: SetQAction) {
    setState((state: StateModel) => {
      state.q = payload;
      return state;
    });
  }

}
