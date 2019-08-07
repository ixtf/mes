import {HttpParams} from '@angular/common/http';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Batch} from '../models/batch';
import {Grade} from '../models/grade';
import {PackageBox} from '../models/package-box';
import {PackageClass} from '../models/package-class';
import {Workshop} from '../models/workshop';
import {ApiService} from '../services/api.service';
import {DefaultCompare, SortByCompare} from '../services/util.service';

const PAGE_NAME = 'UnbudatPackageBoxManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] InitAction`;

  constructor(public payload: { workshopId: string; date: Date; budat: Date; budatClassId: string; }) {
  }
}

export class FilterBatchAction {
  static readonly type = `[${PAGE_NAME}] FilterBatchAction`;

  constructor(public payload: Batch) {
  }
}

export class FilterGradeAction {
  static readonly type = `[${PAGE_NAME}] FilterGradeAction`;

  constructor(public payload: Grade) {
  }
}

export class SaveAction {
  static readonly type = `[${PAGE_NAME}] SaveAction`;

  constructor(public payload: PackageBox) {
  }
}

interface StateModel {
  workshopId?: string;
  workshop?: Workshop;
  date?: Date;
  budat?: Date;
  budatClassId?: string;
  budatClass?: PackageClass;
  filterBatch?: Batch;
  filterGrade?: Grade;
  packageBoxEntities: { [id: string]: PackageBox };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    packageBoxEntities: {}
  }
})
export class UnbudatPackageBoxManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static packageBoxes(state: StateModel): PackageBox[] {
    return Object.values(state.packageBoxEntities).filter(it => {
      if (state.filterGrade) {
        if (it.grade.id !== state.filterGrade.id) {
          return false;
        }
      }
      if (state.filterBatch) {
        if (it.batch.id !== state.filterBatch.id) {
          return false;
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
      return DefaultCompare(a, b);
    });
  }

  @Selector()
  @ImmutableSelector()
  static filterBatch(state: StateModel): Batch {
    return state.filterBatch;
  }

  @Selector()
  @ImmutableSelector()
  static batches(state: StateModel): Batch[] {
    const map: { [id: string]: Batch } = {};
    Object.values(state.packageBoxEntities).forEach(it => {
      const batch = it.batch;
      map[batch.id] = batch;
    });
    return Object.values(map);
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
  static filterGrade(state: StateModel): Grade {
    return state.filterGrade;
  }

  @Selector()
  @ImmutableSelector()
  static grades(state: StateModel): Grade[] {
    const map: { [id: string]: Grade } = {};
    Object.values(state.packageBoxEntities).forEach(it => {
      const grade = it.grade;
      map[grade.id] = grade;
    });
    return Object.values(map).sort(SortByCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({dispatch, setState}: StateContext<StateModel>, {payload: {workshopId, date, budat, budatClassId}}: InitAction) {
    const workshop$ = this.api.getWorkshop(workshopId);
    const packageClass$ = this.api.getPackageClass(budatClassId);
    const params = new HttpParams().set('workshopId', workshopId)
      .set('startDate', moment(date).format('YYYY-MM-DD'))
      .set('endDate', moment().format('YYYY-MM-DD'));
    const packageBoxes$ = this.api.listUnbudatPackageBox(params);
    return forkJoin([workshop$, packageClass$, packageBoxes$]).pipe(
      tap(([workshop, budatClass, packageBoxes]) => setState((state: StateModel) => {
        const packageBoxEntities = PackageBox.toEntities(packageBoxes);
        return {workshopId, workshop, date, budat, budatClassId, budatClass, packageBoxEntities};
      }))
    );
  }

  @Action(FilterBatchAction)
  @ImmutableContext()
  FilterBatchAction({setState}: StateContext<StateModel>, {payload}: FilterBatchAction) {
    setState((state: StateModel) => {
      state.filterBatch = payload;
      return state;
    });
  }

  @Action(FilterGradeAction)
  @ImmutableContext()
  FilterGradeAction({setState}: StateContext<StateModel>, {payload}: FilterGradeAction) {
    setState((state: StateModel) => {
      state.filterGrade = payload;
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

}
