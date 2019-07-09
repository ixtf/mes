import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {isArray, isString} from 'util';
import {ExceptionRecord} from '../models/exception-record';
import {LineMachineProductPlan} from '../models/line-machine-product-plan';
import {Notification} from '../models/notification';
import {Item} from '../models/workshop-product-plan-report';
import {ApiShareService} from '../services/api.service';

export class InitAction {
  static readonly type = '[BoardAbnormalPage] InitAction';

  constructor(public payload: { workshopId: string; lineIds: string | string[] }) {
  }
}

export class RefreshProductPlansAction {
  static readonly type = '[BoardAbnormalPage] RefreshProductPlansAction';
}

export class RefreshExceptionRecordAction {
  static readonly type = '[BoardAbnormalPage] RefreshExceptionRecordAction';
}

export class RefreshNotificationAction {
  static readonly type = '[BoardAbnormalPage] RefreshExceptionRecordAction';
}

export class UpdateProductPlanRecordAction {
  static readonly type = '[BoardAbnormalPage] UpdateProductPlanRecordAction';

  constructor(public payload: { lineMachineProductPlan: LineMachineProductPlan }) {
  }
}

export class UpdateExceptionRecordAction {
  static readonly type = '[BoardAbnormalPage] UpdateExceptionRecordAction';

  constructor(public payload: { exceptionRecord: ExceptionRecord }) {
  }
}

export class UpdateNotificationAction {
  static readonly type = '[BoardAbnormalPage] UpdateNotificationAction';

  constructor(public payload: { notification: Notification }) {
  }
}

interface BoardAbnormalPageStateModel {
  workshopId?: string;
  lineIds?: string[];
  productPlanItems?: Item[];
  exceptionRecords?: ExceptionRecord[];
  notifications?: Notification[];
}

const lineIdFilter = (state: BoardAbnormalPageStateModel, id: string): boolean => {
  const find = (state.lineIds || []).find(it => it === id);
  return !!find;
};

const exceptionRecordFilter = (state: BoardAbnormalPageStateModel, exceptionRecord: ExceptionRecord): boolean => {
  return lineIdFilter(state, exceptionRecord.lineMachine.line.id);
};

const notificationFilter = (state: BoardAbnormalPageStateModel, notification: Notification): boolean => {
  for (const it of (notification.workshops || [])) {
    if (it.id === state.workshopId) {
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

@State<BoardAbnormalPageStateModel>({
  name: 'BoardAbnormalPage',
  defaults: {}
})
export class BoardAbnormalPageState {
  constructor(private api: ApiShareService) {
  }

  @Selector()
  @ImmutableSelector()
  static productPlanItems(state: BoardAbnormalPageStateModel): Item[] {
    return state.productPlanItems || [];
  }

  @Selector()
  @ImmutableSelector()
  static exceptionRecords(state: BoardAbnormalPageStateModel): ExceptionRecord[] {
    return state.exceptionRecords || [];
  }

  @Selector()
  @ImmutableSelector()
  static notifications(state: BoardAbnormalPageStateModel): Notification[] {
    return state.notifications || [];
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState, dispatch}: StateContext<BoardAbnormalPageStateModel>, {payload: {workshopId, lineIds}}: InitAction) {
    setState((state: BoardAbnormalPageStateModel) => {
      state = {};
      state.workshopId = workshopId;
      if (isArray(lineIds)) {
        state.lineIds = lineIds as string[];
      }
      if (isString(lineIds)) {
        state.lineIds = [lineIds as string];
      }
      return state;
    });
    return dispatch([new RefreshProductPlansAction(), new RefreshExceptionRecordAction(), new RefreshNotificationAction()]);
  }

  @Action(RefreshProductPlansAction)
  @ImmutableContext()
  RefreshProductPlansAction({setState, getState}: StateContext<BoardAbnormalPageStateModel>) {
    return this.api.getWorkshop_ProductPlans(getState().workshopId).pipe(
      tap(report => setState((state: BoardAbnormalPageStateModel) => {
        state.productPlanItems = (report && report.items || []).filter(it => lineIdFilter(state, it.line.id));
        return state;
      }))
    );
  }

  @Action(RefreshExceptionRecordAction)
  @ImmutableContext()
  RefreshExceptionRecordAction({setState}: StateContext<BoardAbnormalPageStateModel>) {
    return this.api.listExceptionRecord().pipe(
      tap(exceptionRecords => setState((state: BoardAbnormalPageStateModel) => {
        state.exceptionRecords = exceptionRecords.filter(it => exceptionRecordFilter(state, it));
        return state;
      }))
    );
  }

  @Action(RefreshNotificationAction)
  @ImmutableContext()
  RefreshNotificationAction({setState}: StateContext<BoardAbnormalPageStateModel>) {
    return this.api.listNotification().pipe(
      tap(notifications => setState((state: BoardAbnormalPageStateModel) => {
        state.notifications = notifications.filter(it => notificationFilter(state, it));
        return state;
      }))
    );
  }

  @Action(UpdateProductPlanRecordAction)
  @ImmutableContext()
  UpdateProductPlanRecordAction({getState, dispatch}: StateContext<BoardAbnormalPageStateModel>, {payload: {lineMachineProductPlan}}: UpdateProductPlanRecordAction) {
    if (lineIdFilter(getState(), lineMachineProductPlan.lineMachine.line.id)) {
      return dispatch(new RefreshProductPlansAction());
    }
  }

  @Action(UpdateExceptionRecordAction)
  @ImmutableContext()
  UpdateExceptionRecordAction({setState}: StateContext<BoardAbnormalPageStateModel>, {payload: {exceptionRecord}}: UpdateExceptionRecordAction) {
    setState((state: BoardAbnormalPageStateModel) => {
      state.exceptionRecords = (state.exceptionRecords || []).filter(it => it.id !== exceptionRecord.id);
      if (!exceptionRecord.handled && exceptionRecordFilter(state, exceptionRecord)) {
        state.exceptionRecords = [exceptionRecord].concat(state.exceptionRecords);
      }
      return state;
    });
  }

  @Action(UpdateNotificationAction)
  @ImmutableContext()
  UpdateNotificationAction({setState}: StateContext<BoardAbnormalPageStateModel>, {payload: {notification}}: UpdateNotificationAction) {
    setState((state: BoardAbnormalPageStateModel) => {
      state.notifications = (state.notifications || []).filter(it => it.id !== notification.id);
      if (!notification.deleted && notificationFilter(state, notification)) {
        state.notifications = [notification].concat(state.notifications);
      }
      return state;
    });
  }

}
