import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {switchMap, tap} from 'rxjs/operators';
import {SilkCarRecord} from '../models/silk-car-record';
import {ApiService} from '../services/api.service';

const PAGE_NAME = 'SilkCarRecordPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { id: string }) {
  }
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { startDate: Date, endDate: Date, silkCarCode: string }) {
  }
}

export class PickAction {
  static readonly type = `[${PAGE_NAME}] PickAction`;

  constructor(public payload: { silkCarRecord: SilkCarRecord }) {
  }
}

interface SilkCarRecordPageStateModel {
  silkCarRecord?: SilkCarRecord;
  count?: number;
  first?: number;
  pageSize?: number;
  silkCarRecords?: SilkCarRecord[];
  silkCarRecordEntities: { [id: string]: SilkCarRecord };
}

@State<SilkCarRecordPageStateModel>({
  name: PAGE_NAME,
  defaults: {
    silkCarRecordEntities: {}
  }
})
export class SilkCarRecordPageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRecord(state: SilkCarRecordPageStateModel): SilkCarRecord {
    return state.silkCarRecord;
  }

  @Selector()
  @ImmutableSelector()
  static silkCarRecords(state: SilkCarRecordPageStateModel): SilkCarRecord[] {
    return Object.values(state.silkCarRecordEntities)
      .filter(it => it.endDateTime)
      .sort((a, b) => {
        const aStartDateTime = moment(a.startDateTime);
        const bStartDateTime = moment(b.startDateTime);
        return aStartDateTime.isAfter(bStartDateTime) ? 1 : -1;
      });
  }

  @Selector()
  @ImmutableSelector()
  static count(state: SilkCarRecordPageStateModel): number {
    return state.count;
  }

  @Selector()
  @ImmutableSelector()
  static first(state: SilkCarRecordPageStateModel): number {
    return state.first;
  }

  @Selector()
  @ImmutableSelector()
  static pageSize(state: SilkCarRecordPageStateModel): number {
    return state.pageSize;
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState, dispatch}: StateContext<SilkCarRecordPageStateModel>, {payload: {id}}: InitAction) {
    if (id) {
      return this.api.getSilkCarRecord(id).pipe(
        switchMap(silkCarRecord => {
          setState((state: SilkCarRecordPageStateModel) => {
            state.silkCarRecordEntities = SilkCarRecord.toEntities([silkCarRecord]);
            return state;
          });
          return dispatch(new PickAction({silkCarRecord}));
        }),
      );
    }
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState, dispatch}: StateContext<SilkCarRecordPageStateModel>, {payload: {silkCarCode, startDate, endDate}}: QueryAction) {
    const httpParams = new HttpParams().append('silkCarCode', silkCarCode)
      .append('startDate', moment(startDate).format('YYYY-MM-DD'))
      .append('endDate', moment(endDate).format('YYYY-MM-DD'));
    return this.api.querySilkCarRecord(httpParams).pipe(
      tap(({first, count, pageSize, silkCarRecords}) => setState((state: SilkCarRecordPageStateModel) => {
        state.silkCarRecord = null;
        state.first = first;
        state.count = count;
        state.pageSize = pageSize;
        state.silkCarRecordEntities = SilkCarRecord.toEntities(silkCarRecords);
        return state;
      })),
    );
  }

  @Action(PickAction)
  @ImmutableContext()
  PickAction({setState}: StateContext<SilkCarRecordPageStateModel>, {payload: {silkCarRecord}}: PickAction) {
    setState((state: SilkCarRecordPageStateModel) => {
      state.silkCarRecord = null;
      return state;
    });
    if (silkCarRecord) {
      if (silkCarRecord.eventSources) {
        setState((state: SilkCarRecordPageStateModel) => {
          state.silkCarRecord = silkCarRecord;
          return state;
        });
      } else {
        return this.api.getSilkCarRecord_Events(silkCarRecord.id).pipe(
          tap(eventSources => setState((state: SilkCarRecordPageStateModel) => {
            silkCarRecord.eventSources = eventSources;
            state.silkCarRecord = silkCarRecord;
            state.silkCarRecordEntities[silkCarRecord.id] = silkCarRecord;
            return state;
          }))
        );
      }
    }
  }

}
