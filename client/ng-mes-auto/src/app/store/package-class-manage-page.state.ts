import {ImmutableContext, ImmutableSelector} from '@ngxs-labs/immer-adapter';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {PackageClass} from '../models/package-class';
import {ApiService} from '../services/api.service';
import {SortByCompare} from '../services/util.service';

const PAGE_NAME = 'PackageClassManagePage';

export class InitAction {
  static readonly type = `[${PAGE_NAME}] ${InitAction.name}`;
}

interface StateModel {
  packageClassEntities?: { [id: string]: PackageClass };
}

@State<StateModel>({
  name: PAGE_NAME,
  defaults: {
    packageClassEntities: {},
  }
})
export class PackageClassManagePageState {
  constructor(private api: ApiService) {
  }

  @Selector()
  @ImmutableSelector()
  static packageClasses(state: StateModel): PackageClass[] {
    return Object.values(state.packageClassEntities).sort(SortByCompare);
  }

  @Action(InitAction)
  @ImmutableContext()
  InitAction({setState}: StateContext<StateModel>) {
    return this.api.listPackageClass().pipe(
      tap(packageClasses => setState((state: StateModel) => {
        state.packageClassEntities = PackageClass.toEntities(packageClasses);
        return state;
      }))
    );
  }

}
