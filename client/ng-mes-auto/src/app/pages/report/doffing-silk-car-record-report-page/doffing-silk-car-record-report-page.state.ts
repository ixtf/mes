import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {Batch} from '../../../models/batch';
import {EventSource} from '../../../models/event-source';
import {Grade} from '../../../models/grade';
import {SilkCarRecordAggregate} from '../../../models/silk-car-record';
import {Workshop} from '../../../models/workshop';
import {ApiService} from '../../../services/api.service';
import {CODE_COMPARE} from '../../../services/util.service';

const PAGE_NAME = 'DoffingSilkCarRecordReportPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; startDateTime: Date; endDateTime: Date; }) {
  }
}

export class DoffingSilkCarRecordReportItem {
  batch: Batch;
  grade: Grade;
  items: SilkCarRecordAggregateExtra[];
}

export class SilkCarRecordAggregateExtra extends SilkCarRecordAggregate {
  silkCount: number;
  netWeight: number;
  hasNetWeight: boolean;
}

export class DetailInfo {
  silkCount = 0;
  netWeight = 0.0;
  items: SilkCarRecordAggregateExtra[] = [];
}

const hasEventSource = (eventSources: EventSource[], type: string): boolean => {
  const find = (eventSources || []).filter(it => !it.deleted).find(it => it.type === type);
  return !!find;
};
const collectDetailInfo = (detailInfo: DetailInfo, silkCarRecordAggregateItem: SilkCarRecordAggregateExtra) => {
  detailInfo.silkCount += silkCarRecordAggregateItem.silkCount;
  detailInfo.netWeight += silkCarRecordAggregateItem.netWeight;
  detailInfo.items.push(silkCarRecordAggregateItem);
};

export class InfoItem {
  allDetailInfo = new DetailInfo();
  noWeightDetailInfo = new DetailInfo();
  toDtyDetailInfo = new DetailInfo();
  toDtyConfirmDetailInfo = new DetailInfo();
  packageBoxDetailInfo = new DetailInfo();
  diffDetailInfo = new DetailInfo();

  constructor(private reportItem: DoffingSilkCarRecordReportItem) {
    (reportItem.items || []).forEach(silkCarRecordAggregateItem => {
      collectDetailInfo(this.allDetailInfo, silkCarRecordAggregateItem);
      if (!silkCarRecordAggregateItem.hasNetWeight) {
        collectDetailInfo(this.noWeightDetailInfo, silkCarRecordAggregateItem);
      }
      if (hasEventSource(silkCarRecordAggregateItem.eventSources, 'ToDtyEvent')) {
        collectDetailInfo(this.toDtyDetailInfo, silkCarRecordAggregateItem);
      }
      if (hasEventSource(silkCarRecordAggregateItem.eventSources, 'ToDtyConfirmEvent')) {
        collectDetailInfo(this.toDtyConfirmDetailInfo, silkCarRecordAggregateItem);
      }
    });
  }

  get batch(): Batch {
    return this.reportItem.batch;
  }

  get grade(): Grade {
    return this.reportItem.grade;
  }
}

interface StateModel {
  workshopId?: string;
  startDateTime?: number;
  endDateTime?: number;
  workshopEntities: { [id: string]: Workshop };
  infoItems?: InfoItem[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
  },
})
export class DoffingSilkCarRecordReportPageState {
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
  static infoItems(state: StateModel): InfoItem[] {
    return state.infoItems || [];
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listWorkshop().pipe(
      tap(workshops => setState((state: StateModel) => {
        state.workshopEntities = Workshop.toEntities(workshops);
        state.infoItems = [];
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
    const httpParams = new HttpParams().set('workshopId', workshopId)
      .set('startDateTime', `${moment(startDateTime).valueOf()}`)
      .set('endDateTime', `${moment(endDateTime).valueOf()}`);
    return this.api.doffingSilkCarRecordReport(httpParams).pipe(
      tap(reportItems => setState((state: StateModel) => {
        state.infoItems = (reportItems || []).map(reportItem => new InfoItem(reportItem)).sort((a, b) => {
          let i = a.batch.batchNo.localeCompare(b.batch.batchNo);
          if (i === 0) {
            i = b.grade.sortBy - a.grade.sortBy;
          }
          return i;
        });
        return state;
      })),
    );
  }

}
