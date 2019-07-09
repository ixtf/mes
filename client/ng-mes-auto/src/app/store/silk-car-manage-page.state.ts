import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {SilkCar} from '../models/silk-car';
import {ApiService} from '../services/api.service';

export class InitAction {
  static readonly type = '[SilkCarManagePage] InitAction';
}

interface SilkCarManagePageStateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  silkCars: SilkCar[];
}

@State<SilkCarManagePageStateModel>({
  name: 'SilkCarManagePage',
  defaults: {
    count: 0,
    first: 0,
    pageSize: 50,
    silkCars: [],
  }
})
export class SilkCarManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCars(state: SilkCarManagePageStateModel): SilkCar[] {
    return state.silkCars;
  }

  @Selector()
  static count(state: SilkCarManagePageStateModel): number {
    return state.count;
  }

  @Selector()
  static first(state: SilkCarManagePageStateModel): number {
    return state.first;
  }

  @Selector()
  static pageSize(state: SilkCarManagePageStateModel): number {
    return state.pageSize;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<SilkCarManagePageStateModel>) {
  }

}
