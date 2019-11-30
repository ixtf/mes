import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {SilkSpec} from '../../../components/silk-spec-input/silk-spec-input.component';
import {PackageBox} from '../../../models/package-box';
import {Silk} from '../../../models/silk';
import {ApiService} from '../../../services/api.service';

const PAGE_NAME = 'FlipReportPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { silkSpec: SilkSpec; startDate: Date; endDate: Date }) {
  }
}

export class FlipReportItem {
  silk: Silk;
  packageBoxes: PackageBox[];
}

interface StateModel {
  items?: FlipReportItem[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {},
})
export class FlipReportPageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): FlipReportItem[] {
    return state.items;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch}: StateContext<StateModel>) {
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {silkSpec, startDate, endDate}}: QueryAction) {
    console.log(silkSpec);
  }

}
