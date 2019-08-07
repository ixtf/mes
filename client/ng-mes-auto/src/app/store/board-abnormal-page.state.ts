import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {isArray, isString} from 'util';
import {ExceptionRecord} from '../models/exception-record';
import {LineMachineProductPlan} from '../models/line-machine-product-plan';
import {Notification} from '../models/notification';
import {Item as ProductPlanItem} from '../models/workshop-product-plan-report';
import {ApiShareService} from '../services/api.service';
import {DefaultCompare} from '../services/util.service';

const PAGE_NAME = 'BoardAbnormalPage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { workshopId: string; lineIds: string | string[] }) {
  }
}

export class RefreshAction {
  static readonly type = `[${PAGE_NAME}] ${RefreshAction.name}`;
}

export class ReconnectAction {
  static readonly type = `[${PAGE_NAME}] ${ReconnectAction.name}`;
}

export class RefreshProductPlansAction {
  static readonly type = `[${PAGE_NAME}] ${RefreshProductPlansAction.name}`;
}

export class RefreshExceptionRecordAction {
  static readonly type = `[${PAGE_NAME}] ${RefreshExceptionRecordAction.name}`;
}

export class RefreshNotificationAction {
  static readonly type = `[${PAGE_NAME}] ${RefreshNotificationAction.name}`;
}

export class UpdateProductPlanRecordAction {
  static readonly type = `[${PAGE_NAME}] ${UpdateProductPlanRecordAction.name}`;

  constructor(public payload: { lineMachineProductPlan: LineMachineProductPlan }) {
  }
}

export class UpdateExceptionRecordAction {
  static readonly type = `[${PAGE_NAME}] ${UpdateExceptionRecordAction.name}`;

  constructor(public payload: { exceptionRecord: ExceptionRecord }) {
  }
}

export class UpdateNotificationAction {
  static readonly type = `[${PAGE_NAME}] UpdateNotificationAction`;

  constructor(public payload: { notification: Notification }) {
  }
}

const lineIdFilter = (state: StateModel, id: string): boolean => {
  const find = (state.lineIds || []).find(it => it === id);
  return !!find;
};

const exceptionRecordFilter = (state: StateModel, exceptionRecord: ExceptionRecord): boolean => {
  return lineIdFilter(state, exceptionRecord.lineMachine.line.id);
};

const notificationFilter = (state: StateModel, notification: Notification): boolean => {
  const {workshopId} = state;
  for (const it of (notification.workshops || [])) {
    if (it.id === workshopId) {
      return true;
    }
  }
  for (const it of (notification.lines || [])) {
    if (lineIdFilter(state, it.id)) {
      return true;
    }
  }
  return false;
};

interface StateModel {
  workshopId?: string;
  lineIds?: string[];
  exceptionRecordEntities: { [id: string]: ExceptionRecord };
  notificationEntities: { [id: string]: Notification };
  productPlanItems?: ProductPlanItem[];
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    exceptionRecordEntities: {},
    notificationEntities: {},
  }
})
export class BoardAbnormalPageState {
  constructor(private api: ApiShareService) {
  }

  @Selector()
  @ImmutableSelector()
  static productPlanItems(state: StateModel): ProductPlanItem[] {
    return state.productPlanItems || [];
  }

  @Selector()
  @ImmutableSelector()
  static exceptionRecords(state: StateModel): ExceptionRecord[] {
    return Object.keys(state.exceptionRecordEntities).map(it => state.exceptionRecordEntities[it])
      .sort((o1, o2) => {
        if (o1.id === '0') {
          return -1;
        }
        if (o2.id === '0') {
          return 1;
        }
        return moment(o1.createDateTime).isAfter(o2.createDateTime) ? 1 : -1;
      });
  }

  @Selector()
  @ImmutableSelector()
  static notifications(state: StateModel): Notification[] {
    return Object.keys(state.notificationEntities).map(it => state.notificationEntities[it])
      .sort(DefaultCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState, dispatch}: StateContext<StateModel>, {payload: {workshopId, lineIds}}: InitAction) {
    setState((state: StateModel) => {
      state.workshopId = workshopId;
      if (isArray(lineIds)) {
        state.lineIds = lineIds as string[];
      }
      if (isString(lineIds)) {
        state.lineIds = [lineIds as string];
      }
      return state;
    });
    return dispatch(new RefreshAction());
  }

  @Action(ReconnectAction)
  @ImmutableContext()
  ReconnectAction({dispatch}: StateContext<StateModel>) {
    // setTimeout(() => location.reload(), 10 * 1000);
    return dispatch(new RefreshAction());
  }

  @Action(RefreshAction)
  @ImmutableContext()
  RefreshAction({dispatch}: StateContext<StateModel>) {
    return dispatch([new RefreshProductPlansAction(), new RefreshExceptionRecordAction(), new RefreshNotificationAction()]);
  }

  @Action(RefreshProductPlansAction)
  @ImmutableContext()
  RefreshProductPlansAction({setState, getState}: StateContext<StateModel>) {
    const {workshopId} = getState();
    return this.api.getWorkshop_ProductPlans(workshopId).pipe(
      tap(report => setState((state: StateModel) => {
        state.productPlanItems = (report && report.items || []).filter(it => lineIdFilter(state, it.line.id));
        return state;
      }))
    );
  }

  @Action(RefreshExceptionRecordAction)
  @ImmutableContext()
  RefreshExceptionRecordAction({setState}: StateContext<StateModel>) {
    return this.api.listExceptionRecord().pipe(
      tap(exceptionRecords => setState((state: StateModel) => {
        exceptionRecords = (exceptionRecords || []).filter(it => exceptionRecordFilter(state, it));
        state.exceptionRecordEntities = ExceptionRecord.toEntities(exceptionRecords);
        return state;
      }))
    );
  }

  @Action(RefreshNotificationAction)
  @ImmutableContext()
  RefreshNotificationAction({setState}: StateContext<StateModel>) {
    return this.api.listNotification().pipe(
      tap(notifications => setState((state: StateModel) => {
        notifications = (notifications || []).filter(it => notificationFilter(state, it));
        state.notificationEntities = Notification.toEntities(notifications);
        return state;
      }))
    );
  }

  @Action(UpdateProductPlanRecordAction)
  @ImmutableContext()
  UpdateProductPlanRecordAction({getState, dispatch}: StateContext<StateModel>, {payload: {lineMachineProductPlan}}: UpdateProductPlanRecordAction) {
    if (lineIdFilter(getState(), lineMachineProductPlan.lineMachine.line.id)) {
      return dispatch(new RefreshProductPlansAction());
    }
  }

  @Action(UpdateExceptionRecordAction)
  @ImmutableContext()
  UpdateExceptionRecordAction({setState, getState}: StateContext<StateModel>, {payload: {exceptionRecord}}: UpdateExceptionRecordAction) {
    if (exceptionRecordFilter(getState(), exceptionRecord)) {
      setState((state: StateModel) => {
        if (exceptionRecord.handled) {
          delete state.exceptionRecordEntities[exceptionRecord.id];
        } else {
          state.exceptionRecordEntities[exceptionRecord.id] = ExceptionRecord.assign(exceptionRecord);
        }
        return state;
      });
    }
  }

  @Action(UpdateNotificationAction)
  @ImmutableContext()
  UpdateNotificationAction({setState, getState}: StateContext<StateModel>, {payload: {notification}}: UpdateNotificationAction) {
    if (notificationFilter(getState(), notification)) {
      setState((state: StateModel) => {
        if (notification.deleted) {
          delete state.notificationEntities[notification.id];
        } else {
          state.notificationEntities[notification.id] = Notification.assign(notification);
        }
        return state;
      });
    }
  }

}
