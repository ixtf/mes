import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {SilkCar} from '../models/silk-car';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[SilkCarManagePage] InitAction';
}

interface StateModel {
  count?: number;
  first?: number;
  pageSize?: number;
  q?: string;
  silkCarEntities: { [id: string]: SilkCar };
}

@State<StateModel>({
  name: 'SilkCarManagePage',
  defaults: {
    silkCarEntities: {},
  }
})
export class SilkCarManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCars(state: StateModel): SilkCar[] {
    return Object.values(state.silkCarEntities);
  }

  @Selector()
  static count(state: StateModel): number {
    return state.count;
  }

  @Selector()
  static pageIndex(state: StateModel): number {
    return state.first / state.pageSize;
  }

  @Selector()
  static pageSize(state: StateModel): number {
    return state.pageSize;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    const params = new HttpParams();
    return this.api.listSilkCar(params).pipe(
      tap(({count, first, pageSize, silkCars}) => setState((state: StateModel) => {
        state.count = count;
        state.first = first;
        state.pageSize = pageSize;
        state.silkCarEntities = SilkCar.toEntities(silkCars);
        return state;
      })),
    );
  }

}
