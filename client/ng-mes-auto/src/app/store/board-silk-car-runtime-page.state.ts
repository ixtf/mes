import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {unitOfTime} from 'moment';
import {Observable} from 'rxjs';
import {fromArray} from 'rxjs/internal/observable/fromArray';
import {concatMap, filter, map, switchMap, tap} from 'rxjs/operators';
import {Batch} from '../models/batch';
import {EventSource} from '../models/event-source';
import {Grade} from '../models/grade';
import {SilkCarRecordAggregate} from '../models/silk-car-record';
import {SilkCarRuntime} from '../models/silk-car-runtime';
import {ApiShareService} from '../services/api.service';
import {INTERVAL$} from '../services/util.service';

const PAGE_NAME = 'BoardSilkCarRuntimePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { workshopId: string; timeOut: string }) {
  }
}

export class RefreshAction {
  static readonly type = `[${PAGE_NAME}] RefreshAction`;
}

export class ReconnectAction {
  static readonly type = `[${PAGE_NAME}] ReconnectAction`;
}

export class RefreshSilkCarRuntimeAction {
  static readonly type = `[${PAGE_NAME}] RefreshSilkCarRuntimeAction`;

  constructor(public payload: { silkCarCode: string; }) {
  }
}

export class UpdateSilkCarRuntimeEvent {
  static readonly type = `[${PAGE_NAME}] UpdateSilkCarRuntimeEvent`;

  constructor(public payload: { silkCarCode: string; eventSource: EventSource; }) {
  }
}

export class SilkCarRuntimeReportItem extends SilkCarRecordAggregate {
  silkCount: number;
  netWeight: number;
  hasNetWeight: boolean;
  duration$: Observable<number>;

  static assign(...sources: any[]): SilkCarRuntimeReportItem {
    const result = Object.assign(new SilkCarRuntimeReportItem(), ...sources);
    return result;
  }

  static assignBySilkCarRuntime(silkCarRuntime: SilkCarRuntime) {
    const silkCarRecord = silkCarRuntime.silkCarRecord;
    const item = SilkCarRuntimeReportItem.assign(silkCarRecord);
    item.startDateTime = silkCarRecord.doffingDateTime || silkCarRecord.carpoolDateTime;
    item.initTypeString = silkCarRecord.doffingOperator ? 'DoffingType.' + silkCarRecord.doffingType : 'Common.carpool';
    item.eventSources = silkCarRuntime.eventSources;
    item.silkCount = silkCarRuntime.silkRuntimes && silkCarRuntime.silkRuntimes.length || 0;
    if (item.grade.sortBy >= 100) {
      item.netWeight = item.silkCount * item.batch.silkWeight;
    } else {
      item.netWeight = 0.0;
      (silkCarRuntime.silkRuntimes || []).forEach(it => {
        let silkWeight = item.batch.silkWeight;
        if (it.silk.weight) {
          silkWeight = it.silk.weight;
          item.hasNetWeight = true;
        }
        item.netWeight += silkWeight;
      });
    }
    item.duration$ = INTERVAL$.pipe(map(() => item.duration()));
    // item.duration$ = INTERVAL$.pipe(map(() => item.duration('second')));
    return item;
  }

  duration(uot: unitOfTime.Diff = 'hour'): number {
    return moment().diff(moment(this.startDateTime), uot);
  }

}

export class GroupByBatchGradeItem {
  silkCarCount = 0;
  silkCount = 0;
  netWeight = 0.0;

  constructor(public batch: Batch, public grade: Grade) {
  }

  static groupByKey(batch: Batch, grade: Grade): string {
    return [batch.id, grade.id].join();
  }
}

const isFinishEventSource = (eventSource: EventSource): boolean => {
  switch (eventSource.type) {
    case 'ToDtyEvent':
    case 'ToDtyConfirmEvent':
    case 'PackageBoxEvent':
    case 'SmallPackageBoxEvent':
    case 'TemporaryBoxEvent':
    case 'WarehousePackageBoxFetchEvent':
    case 'RiambSilkCarInfoFetchEvent':
    case 'JikonAdapterSilkCarInfoFetchEvent':
      return true;
  }
  return false;
};

const isContinueEventSource = (eventSource: EventSource): boolean => {
  switch (eventSource.type) {
    case 'ExceptionCleanEvent':
    case 'DyeingPrepareEvent':
    case 'SilkNoteFeedbackEvent':
    case 'JikonAdapterSilkDetachEvent':
    case 'JikonAdapterPackageBoxEvent':
    case 'RiambSilkDetachEvent':
    case 'RiambPackageBoxEvent':
      return true;
  }
  return false;
};

class StateModel {
  workshopId?: string;
  silkCarRuntimeFilter?: any;
  timeOut?: number;
  itemEntities: { [silkCarCode: string]: SilkCarRuntimeReportItem };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    itemEntities: {},
  }
})
export class BoardSilkCarRuntimePageState {
  constructor(private api: ApiShareService) {
  }

  @Selector()
  @ImmutableSelector()
  static allItems(state: StateModel): SilkCarRuntimeReportItem[] {
    return Object.values(state.itemEntities);
  }

  @Selector()
  @ImmutableSelector()
  static timeOutSilkCarRuntimes(state: StateModel): SilkCarRuntimeReportItem[] {
    return Object.values(state.itemEntities).filter(it => {
      return it.duration() > state.timeOut;
    }).sort((a, b) => {
      return moment(a.startDateTime).isAfter(b.startDateTime) ? 1 : -1;
    });
  }

  @Selector()
  @ImmutableSelector()
  static groupByBatchGradeItems(state: StateModel): GroupByBatchGradeItem[] {
    const groupByBatchGradeItemEntities: { [key: string]: GroupByBatchGradeItem } = {};
    Object.values(state.itemEntities).forEach(item => {
      const batch = item.batch;
      const grade = item.grade;
      const groupByKey = GroupByBatchGradeItem.groupByKey(batch, grade);
      let groupByBatchGradeItem = groupByBatchGradeItemEntities[groupByKey];
      if (!groupByBatchGradeItem) {
        groupByBatchGradeItem = new GroupByBatchGradeItem(batch, grade);
        groupByBatchGradeItemEntities[groupByKey] = groupByBatchGradeItem;
      }
      groupByBatchGradeItem.silkCarCount++;
      groupByBatchGradeItem.silkCount += item.silkCount;
      groupByBatchGradeItem.netWeight += item.netWeight;
    });
    return Object.values(groupByBatchGradeItemEntities).sort((a, b) => {
      let i = b.silkCarCount - a.silkCarCount;
      if (i !== 0) {
        return i;
      }
      i = b.silkCount - a.silkCount;
      if (i !== 0) {
        return i;
      }
      i = b.netWeight - a.netWeight;
      return i;
    });
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({getState, setState, dispatch}: StateContext<StateModel>, {payload: {workshopId, timeOut}}: InitAction) {
    setState((state: StateModel) => {
      state = {itemEntities: {}};
      state.workshopId = workshopId;
      state.silkCarRuntimeFilter = (silkCarRuntime: SilkCarRuntime): boolean => {
        let b = silkCarRuntime.silkCarRecord.batch.workshop.id === workshopId;
        if (b) {
          const eventSources = silkCarRuntime.eventSources || [];
          b = !eventSources.find(it => isFinishEventSource(it));
        }
        return b;
      };
      timeOut = timeOut || '0';
      state.timeOut = parseInt(timeOut, 10);
      state.timeOut = state.timeOut > 1 ? state.timeOut : 72;
      return state;
    });
    return dispatch(new RefreshAction());
  }

  @Action(ReconnectAction)
  @ImmutableContext()
  ReconnectAction({dispatch}: StateContext<StateModel>) {
    return dispatch(new RefreshAction());
  }

  @Action(RefreshAction)
  @ImmutableContext()
  RefreshAction(ctx: StateContext<StateModel>) {
    const {workshopId, silkCarRuntimeFilter} = ctx.getState();
    const params = new HttpParams().set('workshopId', workshopId);
    return this.api.listSilkCarRuntimeSilkCarCode(params).pipe(
      switchMap(silkCarCodes => fromArray((silkCarCodes || []))),
      // take(50),
      concatMap(it => this.api.getSilkCarRuntimeByCode(it)),
      filter(silkCarRuntimeFilter),
      tap(silkCarRuntime => this.updateSilkCarRuntime(ctx, silkCarRuntime))
    );
  }

  @Action(RefreshSilkCarRuntimeAction)
  @ImmutableContext()
  RefreshSilkCarRuntimeAction(ctx: StateContext<StateModel>, {payload: {silkCarCode}}: RefreshSilkCarRuntimeAction) {
    return this.api.getSilkCarRuntimeByCode(silkCarCode).pipe(
      tap(silkCarRuntime => this.updateSilkCarRuntime(ctx, silkCarRuntime)),
    );
  }

  @Action(UpdateSilkCarRuntimeEvent)
  @ImmutableContext()
  UpdateSilkCarRuntimeEvent({setState, getState, dispatch}: StateContext<StateModel>, {payload: {silkCarCode, eventSource}}: UpdateSilkCarRuntimeEvent) {
    const refreshSilkCarRuntimeAction = new RefreshSilkCarRuntimeAction({silkCarCode});
    if (eventSource.type === 'SilkCarRuntimeInitEvent' || eventSource.type === 'SilkCarRuntimeAppendEvent') {
      return dispatch(refreshSilkCarRuntimeAction);
    }
    if (isFinishEventSource(eventSource)) {
      setState((state: StateModel) => {
        delete state.itemEntities[silkCarCode];
        return state;
      });
      return;
    }
    if (isContinueEventSource(eventSource)) {
      return;
    }
    if (getState().itemEntities[silkCarCode]) {
      return dispatch(refreshSilkCarRuntimeAction);
    }
  }

  private updateSilkCarRuntime({setState}: StateContext<StateModel>, silkCarRuntime: SilkCarRuntime) {
    setState((state: StateModel) => {
      const silkCarCode = silkCarRuntime.silkCarRecord.silkCar.code;
      if (state.silkCarRuntimeFilter(silkCarRuntime)) {
        state.itemEntities[silkCarCode] = SilkCarRuntimeReportItem.assignBySilkCarRuntime(silkCarRuntime);
      } else {
        delete state.itemEntities[silkCarCode];
      }
      return state;
    });
  }
}
