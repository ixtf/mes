import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Selector, State} from '@ngxs/store';
import {SilkCar} from '../models/silk-car';
import {ApiService} from '../services/api.service';

interface SilkCarManagePageStateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  silkCars: SilkCar[];
  // silkCarEntities: { [id: string]: SilkCar };
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
  constructor(private apiService: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCars(state: SilkCarManagePageStateModel) {
    return state.silkCars;
  }

  @Selector()
  static count(state: SilkCarManagePageStateModel) {
    return state.count;
  }

  @Selector()
  static first(state: SilkCarManagePageStateModel) {
    return state.first;
  }

  @Selector()
  static pageSize(state: SilkCarManagePageStateModel) {
    return state.pageSize;
  }

}
