import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';
import {Batch} from '../models/batch';
import {Grade} from '../models/grade';
import {PackageBox} from '../models/package-box';
import {PackageClass} from '../models/package-class';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {DEFAULT_COMPARE, SORT_BY_COMPARE} from '../services/util.service';

const PAGE_NAME = 'UnbudatPackageBoxManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { workshopId: string; date: Date; budat: Date; budatClassId: string; }) {
  }
}

export class RefreshAction {
  static readonly type = `[${PAGE_NAME}] RefreshAction`;
}

export class SetFilterAction {
  static readonly type = `[${PAGE_NAME}] SetFilterAction`;

  constructor(public payload: Filters) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: PackageBox) {
  }
}

export class MeasureAction {
  static readonly type = `[${PAGE_NAME}] MeasureAction`;

  constructor(public payload: PackageBox) {
  }
}

class Filters {
  batchId: string;
  gradeId: string;
  printed: boolean;
  measured: boolean;
}

interface StateModel {
  workshopId?: string;
  workshop?: Workshop;
  date?: Date;
  budat?: Date;
  budatClassId?: string;
  budatClass?: PackageClass;
  filters: Filters;
  packageBoxEntities: { [id: string]: PackageBox };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    packageBoxEntities: {},
    filters: new Filters(),
  },
})
export class UnbudatPackageBoxManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static packageBoxes(state: StateModel): PackageBox[] {
    return Object.values(state.packageBoxEntities).filter(packageBox => {
      if (state.filters.batchId) {
        if (packageBox.batch.id !== state.filters.batchId) {
          return false;
        }
      }

      if (state.filters.gradeId) {
        if (packageBox.grade.id !== state.filters.gradeId) {
          return false;
        }
      }

      if (!isNullOrUndefined(state.filters.printed)) {
        if (state.filters.printed) {
          if (packageBox.printCount <= 0) {
            return false;
          }
        } else {
          if (packageBox.printCount > 0) {
            return false;
          }
        }
      }

      if (!isNullOrUndefined(state.filters.measured)) {
        if (state.filters.measured) {
          if (!packageBox.budat) {
            return false;
          }
        } else {
          if (packageBox.budat) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (!a.budat || !b.budat) {
        return a.budat ? 1 : -1;
      }
      if (a.printCount < 1 || b.printCount < 1) {
        return a.printCount < 1 ? -1 : 1;
      }
      return DEFAULT_COMPARE(a, b);
    });
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: StateModel): Batch[] {
    const map: { [id: string]: Batch } = {};
    Object.values(state.packageBoxEntities).forEach(it => {
      const batch = it.batch;
      map[batch.id] = batch;
    });
    return Object.values(map).sort((a, b) => a.batchNo.localeCompare(b.batchNo));
  }

  @Selector()
  @ImmutableSelector()
  static workshop(state: StateModel): Workshop {
    return state.workshop;
  }

  @Selector()
  @ImmutableSelector()
  static budat(state: StateModel): Date {
    return state.budat;
  }

  @Selector()
  @ImmutableSelector()
  static budatClass(state: StateModel): PackageClass {
    return state.budatClass;
  }

  @Selector()
  @ImmutableSelector()
  static grades(state: StateModel): Grade[] {
    const map: { [id: string]: Grade } = {};
    UnbudatPackageBoxManagePageState.packageBoxes(state).forEach(it => {
      const grade = it.grade;
      map[grade.id] = grade;
    });
    return Object.values(map).sort(SORT_BY_COMPARE);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch, setState}: StateContext<StateModel>, {payload: {workshopId, date, budat, budatClassId}}: InitAction) {
    const workshop$ = this.api.getWorkshop(workshopId);
    const packageClass$ = this.api.getPackageClass(budatClassId);
    return forkJoin([workshop$, packageClass$]).pipe(
      tap(([workshop, budatClass]) => setState((state: StateModel) => {
        state.workshopId = workshopId;
        state.workshop = workshop;
        state.budat = budat;
        state.budatClassId = budatClassId;
        state.budatClass = budatClass;
        state.date = date;
        return state;
      })),
      switchMap(() => dispatch(new RefreshAction())),
    );
  }

  @Action(RefreshAction, {cancelUncompleted: true})
  @ImmutableContext()
  RefreshAction({getState, setState}: StateContext<StateModel>) {
    const {workshopId, date} = getState();
    const params = new HttpParams().set('workshopId', workshopId)
      .set('startDate', moment(date).format('YYYY-MM-DD'))
      .set('endDate', moment().format('YYYY-MM-DD'));
    return this.api.listUnbudatPackageBox(params).pipe(
      tap(packageBoxes => setState((state: StateModel) => {
        state.packageBoxEntities = PackageBox.toEntities(packageBoxes);
        return state;
      }))
    );
  }

  @Action(SetFilterAction)
  @ImmutableContext()
  FilterAction({setState}: StateContext<StateModel>, {payload}: SetFilterAction) {
    setState((state: StateModel) => {
      state.filters = payload;
      return state;
    });
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

  @Action(MeasureAction)
  @ImmutableContext()
  MeasureAction({setState}: StateContext<StateModel>, {payload}: MeasureAction) {
    // return this.api.saveNotification(payload).pipe(
    //   tap(it => setState((state: StateModel) => {
    //     const notification = PackageBox.assign(it);
    //     state.packageBoxEntities[notification.id] = notification;
    //     return state;
    //   }))
    // );
  }

}
