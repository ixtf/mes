import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Notification} from '../models/notification';
import {ApiService} from '../services/api.service';
import {DefaultCompare} from '../services/util.service';

const PAGE_NAME = 'NotificationManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: Notification) {
  }
}

export class DeleteAction {
  static readonly type = `[${PAGE_NAME}] DeleteAction`;

  constructor(public payload: Notification) {
  }
}

interface StateModel {
  notificationEntities: { [id: string]: Notification };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    notificationEntities: {}
  }
})
export class NotificationManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static notifications(state: StateModel): Notification[] {
    return Object.values(state.notificationEntities).filter(DefaultCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listNotification().pipe(
      tap(notifications => setState((state: StateModel) => {
        state.notificationEntities = Notification.toEntities(notifications);
        return state;
      }))
    );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    return this.api.saveNotification(payload).pipe(
      tap(it => setState((state: StateModel) => {
        const notification = Notification.assign(it);
        state.notificationEntities[notification.id] = notification;
        return state;
      }))
    );
  }

  @Action(DeleteAction)
  @ImmutableContext()
  DeleteAction({setState}: StateContext<StateModel>, {payload}: DeleteAction) {
    return this.api.deleteNotification(payload).pipe(
      tap(() => setState((state: StateModel) => {
        delete state.notificationEntities[payload.id];
        return state;
      }))
    );
  }

}
