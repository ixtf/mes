import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {PackageBox} from '../models/package-box';
import {ApiService} from '../services/api.service';
import {DefaultCompare} from '../services/util.service';

const PAGE_NAME = 'PackageBoxManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] ${InitAction.name}`;
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] ${SaveAction.name}`;

  constructor(public payload: PackageBox) {
  }
}

export class DeleteAction {
  static readonly type = `[${PAGE_NAME}] DeleteAction`;

  constructor(public payload: PackageBox) {
  }
}

interface StateModel {
  packageBoxEntities: { [id: string]: PackageBox };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    packageBoxEntities: {}
  }
})
export class PackageBoxManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static packageBoxes(state: StateModel): PackageBox[] {
    return Object.values(state.packageBoxEntities).filter(DefaultCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    // return this.api.listNotification().pipe(
    //   tap(notifications => setState((state: StateModel) => {
    //     state.notificationEntities = PackageBox.toEntities(notifications);
    //     return state;
    //   }))
    // );
  }

  @Action(SaveAction)
  @ImmutableContext()
  SaveAction({setState}: StateContext<StateModel>, {payload}: SaveAction) {
    // return this.api.saveNotification(payload).pipe(
    //   tap(it => setState((state: StateModel) => {
    //     const notification = PackageBox.assign(it);
    //     state.packageBoxEntities[notification.id] = notification;
    //     return state;
    //   }))
    // );
  }

  @Action(DeleteAction)
  @ImmutableContext()
  DeleteAction({setState}: StateContext<StateModel>, {payload}: DeleteAction) {
    // return this.api.deleteNotification(payload).pipe(
    //   tap(() => setState((state: StateModel) => {
    //     delete state.packageBoxEntities[payload.id];
    //     return state;
    //   }))
    // );
  }

}
