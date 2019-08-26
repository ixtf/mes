import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {tap} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';
import {PackageBox} from '../models/package-box';
import {ApiService} from '../services/api.service';
import {DEFAULT_COMPARE} from '../services/util.service';

const PAGE_NAME = 'PackageBoxManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;
}

export class QueryAction {
  static readonly type = `[${PAGE_NAME}] QueryAction`;

  constructor(public payload: { workshopId: string; code: string; batchId: string; gradeId: string; productId: string; budatClassId: string; type: string; startDate: Date; endDate: Date, first: number, pageSize: number }) {
  }
}

export class DeleteAction {
  static readonly type = `[${PAGE_NAME}] DeleteAction`;

  constructor(public payload: PackageBox) {
  }
}

interface StateModel {
  count?: number;
  first?: number;
  pageSize?: number;
  workshopId?: string;
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

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`];
  }

  @Selector()
  @ImmutableSelector()
  static packageBoxes(state: StateModel): PackageBox[] {
    return Object.values(state.packageBoxEntities).filter(DEFAULT_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static count(state: StateModel): number {
    return state.count;
  }

  @Selector()
  @ImmutableSelector()
  static pageIndex(state: StateModel): number {
    return state.first / state.pageSize;
  }

  @Selector()
  @ImmutableSelector()
  static pageSize(state: StateModel): number {
    return state.pageSize;
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

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, code, batchId, gradeId, budatClassId, type, startDate, endDate, productId, first, pageSize}}: QueryAction) {
    if (isNullOrUndefined(pageSize)) {
      pageSize = 50;
    }
    let params = new HttpParams().set('workshopId', workshopId)
      .set('startDate', moment(startDate).format('YYYY-MM-DD'))
      .set('endDate', moment(endDate).format('YYYY-MM-DD'))
      .set('first', `${first}`)
      .set('pageSize', `${pageSize}`);
    if (code) {
      params = params.set('packageBoxCode', code);
    } else {
      if (type) {
        params = params.set('packageBoxType', type);
      }
      if (batchId) {
        params = params.set('batchId', batchId);
      }
      if (gradeId) {
        params = params.set('gradeId', gradeId);
      }
      if (productId) {
        params = params.set('productId', productId);
      }
      if (budatClassId) {
        params = params.set('budatClassId', budatClassId);
      }
    }
    return this.api.listPackageBox(params).pipe(
      tap(it => setState((state: StateModel) => {
        state.count = it.count;
        state.first = it.first;
        state.pageSize = it.pageSize;
        state.workshopId = workshopId;
        state.packageBoxEntities = PackageBox.toEntities(it.packageBoxes);
        return state;
      }))
    );
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
