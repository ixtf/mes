import {Injectable} from '@angular/core';
import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Selector, State} from '@ngxs/store';
import {Batch} from '../../../models/batch';
import {ApiService} from '../../../services/api.service';

interface OperatorManagePageStateModel {
  count: number;
  first: number;
  pageSize: number;
  q?: string;
  batches: Batch[];
  // silkCarEntities: { [id: string]: SilkCar };
}

@State<OperatorManagePageStateModel>({
  name: 'OperatorManagePage',
  defaults: {
    count: 0,
    first: 0,
    pageSize: 50,
    batches: [],
  },
})
@Injectable()
export class OperatorManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: OperatorManagePageStateModel): Batch[] {
    return state.batches;
  }

  @Selector()
  @ImmutableSelector()
  static count(state: OperatorManagePageStateModel): number {
    return state.count;
  }

  @Selector()
  @ImmutableSelector()
  static first(state: OperatorManagePageStateModel): number {
    return state.first;
  }

  @Selector()
  @ImmutableSelector()
  static pageSize(state: OperatorManagePageStateModel): number {
    return state.pageSize;
  }

}
