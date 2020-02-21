import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCar} from '../../../models/silk-car';
import {ApiService} from '../../../services/api.service';

const PAGE_NAME = 'SilkCarManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: SilkCar) {
  }
}

export class BatchSaveAction {
  static readonly type = `[${PAGE_NAME}] BatchSaveAction`;

  constructor(public payload: SilkCar[]) {
  }
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { first: number; pageSize: number; }) {
  }
}

interface StateModel {
  count?: number;
  first?: number;
  pageSize?: number;
  q?: string;
  silkCarEntities: { [id: string]: SilkCar };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    silkCarEntities: {},
  },
})
@Injectable()
export class SilkCarManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCars(state: StateModel): SilkCar[] {
    return Object.values(state.silkCarEntities);
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
    return this.api.listSilkCar(params).pipe(
      tap(({count, silkCars}) => setState((state: StateModel) => {
        state.count = count;
        state.first = first;
        state.pageSize = pageSize;
        state.silkCarEntities = SilkCar.toEntities(silkCars);
        return state;
      })),
    );
  }

}
