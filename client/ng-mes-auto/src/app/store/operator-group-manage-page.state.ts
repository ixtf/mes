import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Selector, State} from '@ngxs/store';
import {Batch} from '../models/batch';
import {ApiService} from '../services/api.service';

interface OperatorGroupManagePageStateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  batches: Batch[];
  // silkCarEntities: { [id: string]: SilkCar };
}

@State<OperatorGroupManagePageStateModel>({
  name: 'OperatorGroupManagePage',
  defaults: {
    count: 0,
    first: 0,
    pageSize: 50,
    batches: [],
  }
})
export class OperatorGroupManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: OperatorGroupManagePageStateModel): Batch[] {
    return state.batches;
  }

  @Selector()
  static count(state: OperatorGroupManagePageStateModel): number {
    return state.count;
  }

  @Selector()
  static first(state: OperatorGroupManagePageStateModel): number {
    return state.first;
  }

  @Selector()
  static pageSize(state: OperatorGroupManagePageStateModel): number {
    return state.pageSize;
  }

}
