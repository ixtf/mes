import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {Batch} from '../models/batch';
import {EventSource} from '../models/event-source';
import {Grade} from '../models/grade';
import {SilkCarRecordAggregate} from '../models/silk-car-record';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {CodeCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[DoffingSilkCarRecordReportPage] InitAction';
}

export class QueryAction {
  static readonly type = '[DoffingSilkCarRecordReportPage] QueryAction';

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
  workshops?: Workshop[];
  infoItems?: InfoItem[];
}

@State<StateModel>({
  name: 'DoffingSilkCarRecordReportPage',
  defaults: {}
})
export class DoffingSilkCarRecordReportPageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return state.workshops || [];
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
        state.workshops = workshops.sort(CodeCompare);
        if (!state.workshopId) {
          state.workshopId = state.workshops[0].id;
        }
        state.infoItems = [];
        return state;
      }))
    );
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, startDateTime, endDateTime}}: QueryAction) {
    console.log(moment(startDateTime).millisecond());
    const httpParams = new HttpParams().set('workshopId', workshopId)
      .append('startDateTime', `${moment(startDateTime).valueOf()}`)
      .append('endDateTime', `${moment(endDateTime).valueOf()}`);
    return this.api.doffingSilkCarRecordReport(httpParams).pipe(
      tap(reportItems => setState((state: StateModel) => {
        state.workshopId = workshopId;
        state.infoItems = (reportItems || []).map(reportItem => new InfoItem(reportItem)).sort((a, b) => {
          let i = a.batch.batchNo.localeCompare(b.batch.batchNo);
          if (i === 0) {
            i = b.grade.sortBy - a.grade.sortBy;
          }
          return i;
        });
        return state;
      }))
    );
  }

}
