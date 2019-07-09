import {ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {PackageClass} from '../models/package-class';
import {ApiService} from '../services/api.service';
import {SortByCompare} from '../services/util.service';

export class InitAction {
  static readonly type = '[PackageClassManagePage] InitAction';
}

interface PackageClassManagePageStateModel {
  q?: string;
  packageClasses?: PackageClass[];
}

@State<PackageClassManagePageStateModel>({
  name: 'PackageClassManagePage',
  defaults: {}
})
export class PackageClassManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static packageClasses(state: PackageClassManagePageStateModel) {
    return (state.packageClasses || []).sort(SortByCompare);
  }

  @Action(InitAction)
  InitAction({setState}: StateContext<PackageClassManagePageStateModel>) {
    return this.api.listPackageClass().pipe(
      tap(packageClasses => setState((state: PackageClassManagePageStateModel) => {
        state.packageClasses = packageClasses;
        return state;
      }))
    );
  }

}
