import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import * as moment from 'moment';
import {forkJoin} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Grade} from '../../models/grade';
import {PackageBox} from '../../models/package-box';
import {PackageClass} from '../../models/package-class';
import {Product} from '../../models/product';
import {Workshop} from '../../models/workshop';
import {ApiService} from '../../services/api.service';
import {CODE_COMPARE, SORT_BY_COMPARE} from '../../services/util.service';

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
  workshopEntities: { [id: string]: Workshop };
  productEntities: { [id: string]: Product };
  gradeEntities: { [id: string]: Grade };
  packageClassEntities: { [id: string]: PackageClass };
  packageBoxEntities: { [id: string]: PackageBox };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    workshopEntities: {},
    productEntities: {},
    gradeEntities: {},
    packageClassEntities: {},
    packageBoxEntities: {},
  },
})
@Injectable()
export class PackageBoxManagePageState {
  constructor(private api: ApiService) {
  }

  static storageIds(): string[] {
    return [`${PAGE_NAME}.workshopId`];
  }

  @Selector()
  @ImmutableSelector()
  static packageBoxes(state: StateModel): PackageBox[] {
    return Object.values(state.packageBoxEntities).filter(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static workshopId(state: StateModel): string {
    return state.workshopId;
  }

  @Selector()
  @ImmutableSelector()
  static workshops(state: StateModel): Workshop[] {
    return Object.values(state.workshopEntities).sort(CODE_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static products(state: StateModel): Product[] {
    return Object.values(state.productEntities);
  }

  @Selector()
  @ImmutableSelector()
  static grades(state: StateModel): Grade[] {
    return Object.values(state.gradeEntities).sort(SORT_BY_COMPARE);
  }

  @Selector()
  @ImmutableSelector()
  static packageClasses(state: StateModel): PackageClass[] {
    return Object.values(state.packageClassEntities);
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
    const workshops$ = this.api.listWorkshop();
    const grades$ = this.api.listGrade();
    const products$ = this.api.listProduct();
    const packageClasses$ = this.api.listPackageClass();
    return forkJoin([workshops$, products$, grades$, packageClasses$]).pipe(
      tap(([workshops, products, grades, packageClasses]) => setState((state: StateModel) => {
        state.workshopEntities = Workshop.toEntities(workshops);
        state.productEntities = Product.toEntities(products);
        state.gradeEntities = Grade.toEntities(grades);
        state.packageClassEntities = PackageClass.toEntities(packageClasses);
        return state;
      })),
    );
  }

  @Action(QueryAction)
  @ImmutableContext()
  QueryAction({setState}: StateContext<StateModel>, {payload: {workshopId, code, batchId, gradeId, budatClassId, type, startDate, endDate, productId, first, pageSize}}: QueryAction) {
    pageSize = pageSize || 50;
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
      })),
    );
  }

  @Action(DeleteAction)
  @ImmutableContext()
  DeleteAction({setState}: StateContext<StateModel>, {payload}: DeleteAction) {
    return this.api.deletePackageBox(payload).pipe(
      tap(() => setState((state: StateModel) => {
        delete state.packageBoxEntities[payload.id];
        return state;
      })),
    );
  }

}
