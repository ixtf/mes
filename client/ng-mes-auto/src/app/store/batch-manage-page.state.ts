import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Selector, State} from '@ngxs/store';
import {Batch} from '../models/batch';
import {ApiService} from '../services/api.service';

const PAGE_NAME = 'BatchManagePage';

interface StateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  batches: Batch[];
  // silkCarEntities: { [id: string]: SilkCar };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    count: 0,
    first: 0,
    pageSize: 50,
    batches: [],
  }
})
export class BatchManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: StateModel): Batch[] {
    return state.batches;
  }

  @Selector()
  static count(state: StateModel): number {
    return state.count;
  }

  @Selector()
  static first(state: StateModel): number {
    return state.first;
  }

  @Selector()
  static pageSize(state: StateModel): number {
    return state.pageSize;
  }

}
