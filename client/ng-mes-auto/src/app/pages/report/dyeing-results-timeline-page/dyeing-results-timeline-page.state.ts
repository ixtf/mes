import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {forkJoin} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SilkSpec} from '../../../components/silk-spec-input/silk-spec-input.component';
import {DyeingResult} from '../../../models/dyeing-result';
import {ApiService} from '../../../services/api.service';

const PAGE_NAME = 'DyeingResultsTimelinePage';
const SIZE = 10;
const HTTP_PARAMS = new HttpParams().set('size', `${SIZE}`);

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { lineMachineId: string; spindle: number }) {
  }
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: SilkSpec) {
  }
}

export class MoreAction {
  static readonly type = `[${PAGE_NAME}] MoreAction`;

  constructor(public payload: { type: 'FIRST' | 'CROSS'; }) {
  }
}

class DyeingResultModel {
  ended = true;
  dyeingResults: DyeingResult[] = [];

  setData(dyeingResults: DyeingResult[]): DyeingResultModel {
    const ret = new DyeingResultModel();
    ret.ended = dyeingResults.length < SIZE;
    ret.dyeingResults = dyeingResults;
    return ret;
  }

  append(dyeingResults: DyeingResult[]): DyeingResultModel {
    const ret = new DyeingResultModel();
    ret.ended = dyeingResults.length < SIZE;
    ret.dyeingResults = (this.dyeingResults || []).concat(dyeingResults.slice(1));
    return ret;
  }

  last(): DyeingResult {
    if ((this.dyeingResults || []).length > 0) {
      return this.dyeingResults[this.dyeingResults.length - 1];
    }
  }
}

interface StateModel {
  silkSpec?: SilkSpec;
  FIRST: DyeingResultModel;
  CROSS: DyeingResultModel;
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    FIRST: new DyeingResultModel(),
    CROSS: new DyeingResultModel(),
  },
})
export class DyeingResultsTimelinePageState {
  constructor(private api: ApiService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.lineMachineId`];
  }

  @Selector()
  @ImmutableSelector()
  static firsts(state: StateModel): DyeingResult[] {
    return state.FIRST.dyeingResults || [];
  }

  @Selector()
  @ImmutableSelector()
  static firstsEnded(state: StateModel): boolean {
    return state.FIRST.ended;
  }

  @Selector()
  @ImmutableSelector()
  static crosses(state: StateModel): DyeingResult[] {
    return state.CROSS.dyeingResults || [];
  }

  @Selector()
  @ImmutableSelector()
  static crossesEnded(state: StateModel): boolean {
    return state.CROSS.ended;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch}: StateContext<StateModel>) {
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload}: QueryAction) {
    const httpParams = HTTP_PARAMS.set('lineMachineId', `${payload.lineMachine.id}`).set('spindle', `${payload.spindle}`);
    const firsts$ = this.api.dyeingResultsTimeline(httpParams.set('type', 'FIRST'));
    const crosses$ = this.api.dyeingResultsTimeline(httpParams.set('type', 'CROSS'));
    return forkJoin([firsts$, crosses$]).pipe(
      tap(([firsts, crosses]) => setState((state: StateModel) => {
        state.silkSpec = payload;
        state.FIRST = state.FIRST.setData(firsts);
        state.CROSS = state.CROSS.setData(crosses);
        return state;
      })),
    );
  }

  @Action(MoreAction)
  @ImmutableContext()
  MoreAction({setState, getState}: StateContext<StateModel>, {payload: {type}}: MoreAction) {
    const {silkSpec: {lineMachine, spindle}} = getState();
    const httpParams = HTTP_PARAMS
      .set('type', type)
      .set('lineMachineId', lineMachine.id)
      .set('spindle', `${spindle}`)
      .set('currentId', getState()[type].last().id);
    return this.api.dyeingResultsTimeline(httpParams).pipe(
      tap(ret => setState((state: StateModel) => {
        state[type] = state[type].append(ret);
        return state;
      })),
    );
  }
}
