import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {Operator} from '../models/operator';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CODE_COMPARE} from '../services/util.service';

const PAGE_NAME = 'ToDtyReportPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; startDateTime: Date; endDateTime: Date; }) {
  }
}

export class ToDtyReportItem {
  operator: Operator;
  silkCarRecordCount = 0;
  silkCount = 0;
}

interface StateModel {
  workshopId?: string;
  startDateTime?: number;
  endDateTime?: number;
  workshopEntities: { [id: string]: Workshop };
  itemEntities: { [operatorId: string]: ToDtyReportItem };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
    itemEntities: {},
  },
})
export class ToDtyReportPageState {
  constructor(private api: ApiService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`, `${PAGE_NAME}.startDateTime`, `${PAGE_NAME}.endDateTime`];
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static startDateTime(state: StateModel): number {
    return state.startDateTime;
  }

  @Selector()
  @ImmutableSelector()
  static startDate_hour(state: StateModel): number {
    const startMoment = state.startDateTime && moment(state.startDateTime);
    return startMoment && startMoment.hour() || 8;
  }

  @Selector()
  @ImmutableSelector()
  static startDate_minute(state: StateModel): number {
    const startMoment = state.startDateTime && moment(state.startDateTime);
    return startMoment && startMoment.minute() || 0;
  }

  @Selector()
  @ImmutableSelector()
  static endDateTime(state: StateModel): number {
    return state.endDateTime;
  }

  @Selector()
  @ImmutableSelector()
  static endDate_hour(state: StateModel): number {
    const startMoment = state.endDateTime && moment(state.endDateTime);
    return startMoment && startMoment.hour() || 8;
  }

  @Selector()
  @ImmutableSelector()
  static endDate_minute(state: StateModel): number {
    const startMoment = state.endDateTime && moment(state.endDateTime);
    return startMoment && startMoment.minute() || 0;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static operators(state: StateModel): Operator[] {
    return Object.values(state.itemEntities)
      .map(it => it.operator)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  @Selector()
  @ImmutableSelector()
  static items(state: StateModel): ToDtyReportItem[] {
    return ToDtyReportPageState.operators(state).map(it => state.itemEntities[it.id]);
  }

  @Selector()
  @ImmutableSelector()
  static totalItemMap(state: StateModel): ToDtyReportItem {
    const ret = {silkCount: 0, silkCarRecordCount: 0};
    ToDtyReportPageState.items(state).forEach(item => {
      ret.silkCarRecordCount += item.silkCarRecordCount;
      ret.silkCount += item.silkCount;
    });
    return ret as ToDtyReportItem;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      tap(workshops => setState((state: StateModel) => {
        state.workshopEntities = Workshop.toEntities(workshops);
        return state;
      })),
    );
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, startDateTime, endDateTime}}: QueryAction) {
    setState((state: StateModel) => {
      state.workshopId = workshopId;
      state.startDateTime = moment(startDateTime).valueOf();
      state.endDateTime = moment(endDateTime).valueOf();
      return state;
    });
    return this.api.toDtyReport({workshopId, startDateTime: `${moment(startDateTime).valueOf()}`, endDateTime: `${moment(endDateTime).valueOf()}`}).pipe(
      tap(items => setState((state: StateModel) => {
        state.itemEntities = (items || []).reduce((acc, cur) => {
          acc[cur.operator.id] = cur;
          return acc;
        }, {});
        return state;
      })),
    );
  }

}