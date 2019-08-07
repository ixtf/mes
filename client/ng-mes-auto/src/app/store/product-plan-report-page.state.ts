import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {switchMap, tap} from 'rxjs/operators';
import {Workshop} from '../models/workshop';
import {Item as ProductPlanItem} from '../models/workshop-product-plan-report';
import {ApiService} from '../services/api.service';
import {CodeCompare} from '../services/util.service';

const PAGE_NAME = 'ProductPlanReportPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string }) {
  }
}

interface StateModel {
  workshopId?: string;
  workshopEntities?: { [id: string]: Workshop };
  productPlanItems?: ProductPlanItem[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {}
})
export class ProductPlanReportPageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static productPlanItems(state: StateModel): ProductPlanItem[] {
    return state.productPlanItems || [];
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CodeCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState, getState, dispatch}: StateContext<StateModel>) {
    let {workshopId} = getState();
    if (workshopId) {
      return;
    }
    return this.api.listWorkshop().pipe(
      switchMap(workshops => {
        setState((state: StateModel) => {
          state.workshopEntities = Workshop.toEntities(workshops);
          return state;
        });
        workshopId = ProductPlanReportPageState.workshops(getState())[0].id;
        return dispatch(new QueryAction({workshopId}));
      }),
    );
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState, getState}: StateContext<StateModel>, {payload: {workshopId}}: QueryAction) {
    if (workshopId === getState().workshopId) {
      return;
    }
    return this.api.getWorkshop_ProductPlans(workshopId).pipe(
      tap(report => setState((state: StateModel) => {
        state.workshopId = workshopId;
        state.productPlanItems = (report && report.items || []);
        return state;
      })),
    );
  }

}
