import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Selector, State} from '@ngxs/store';
import {Batch} from '../models/batch';
import {ApiService} from '../services/api.service';

interface SilkCarManagePageStateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  batches: Batch[];
  // silkCarEntities: { [id: string]: SilkCar };
}

@State<SilkCarManagePageStateModel>({
  name: 'BatchManagePage',
  defaults: {
    count: 0,
    first: 0,
    pageSize: 50,
    batches: [],
  }
})
export class BatchManagePageState {
  constructor(private apiService: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: SilkCarManagePageStateModel) {
    return state.batches;
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
